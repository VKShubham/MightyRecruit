import { Request, Response } from "express";
import pool from "../config/db";
import logger from "../utils/logger";
import { Application } from "../@types/application";
import { ChangeApplicationStatusSchema, CreateApplicationSchema } from "../validators/zod";

const createApplication = async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user.role === 'Candidate') {
        try {
            const Result = CreateApplicationSchema.safeParse(req.body);
            if (!Result.success || !Result.data) {
                res.status(400).json({ message: "Invalid Job data" });
                return;
            }
            const { Jobid } = Result.data;

            const jobs = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [Jobid]);
            const candidateResult = await pool.query(`SELECT id FROM candidate WHERE userid = $1`, [req.user.id]);
            const existingApplication = await pool.query(
                `SELECT status FROM applications WHERE candidate_id = $1 AND status = 'Hired'`,
                [candidateResult.rows[0].id]
            );

            if (existingApplication.rowCount > 0) {
                res.status(409).json({ message: "You are already hired in our company" });
                return;
            }

            if (jobs.rowCount === 1) {
                await pool.query(`INSERT INTO applications (job_id, candidate_id, status, updated_by, updated_at) VALUES ($1, $2, $3, $4, $5)`,
                    [
                        Jobid,
                        candidateResult.rows[0].id,
                        'Pending', // Default pending when application creates
                        req.user.id,
                        new Date(Date.now())
                    ]
                );
                logger.info("Application Created", { userid: req.user.id, jobid: Jobid });
                res.status(200).json({ message: "Applied Successfully!" });
                return;
            }
            else {
                logger.info("Application Create Error: Job Not Exist", { userid: req.user.id, jobid: Jobid });
                res.status(404).json({ message: "Job Doesn't Exist" });
                return;
            }

        } catch (error: any) {
            logger.error("CreateApplication error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
            return;
        }
    }
    else {
        res.status(403).json({ message: 'You are not Authorized to Apply For a Job' });
        return;
    }
}

const getUserApplications = async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        try {
            const userid = req.user.id;
            if(!userid) {
                res.status(400).json({ message: "Failed to get Userid" });
                return;
            }

            const candidateResult = await pool.query(`SELECT id FROM candidate WHERE userid = $1`, [userid]);
            const usersApplications = await pool.query(`SELECT id, applied_at, status, job_id FROM applications WHERE candidate_id = $1`, [candidateResult.rows[0].id]);
            if (usersApplications.rowCount > 0) {
                const Result: any[] = await Promise.all(usersApplications.rows.map(async (Application: Application) => {
                    const TrackingResult = await pool.query(
                        `SELECT i.status AS interview_status, i.result AS interview_result, s.stage_name AS interview_title FROM interviews i 
                        JOIN selection_pipeline s ON s.id = i.selection_pipeline_id
                        WHERE i.application_id = $1`
                        , [Application.id])
                    return {
                       tracking: TrackingResult.rows,
                       ...Application
                    }
                }))
                res.status(200).json({ message: 'Application Fetched Successfully', data: Result });
                return;
            }
            else {
                res.status(204).json({ message: "No Application Found" });
                return;
            }
        } catch (error: any) {
            logger.error("GetUserApplication error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
            return;
        }
    }
    else {
        res.status(403).json({ message: 'You are not Authorized' });
        return;
    }
}

const getAllPendingApplications = async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user.role === 'HR') {
        try {
            const Applications = await pool.query(`SELECT * FROM applications WHERE status = $1`, ['Pending']);

            if (Applications.rowCount > 0) {
                res.status(200).json({ message: 'Pending applications Fetched Successfully', data: Applications.rows });
                return;
            }
            else {
                res.status(204).json({ message: "No pending application found" });
                return;
            }

        } catch (error: any) {
            logger.error("GetUserApplication error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
            return;
        }
    }
    else {
        res.status(403).json({ message: 'You are not Authorized' });
        return;
    }
}

const changeApplicationStatus = async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user.role === 'HR') {
        try {
            const Result = ChangeApplicationStatusSchema.safeParse(req.body);

            if (!Result.success) {
                res.status(400).json({ message: 'Please pass valid status' });
                return;
            }

            const noteObj = {
                created_by: req.user.username,
                created_at: new Date(),
                status: Result.data?.status,
                notes: Result.data?.notes,
            }

            await pool.query(`UPDATE applications SET status = $1, notes = COALESCE(notes, '[]'::jsonb) || $2::jsonb, updated_at = $3, updated_by = $4 WHERE id = $5`, [Result.data.status, JSON.stringify([noteObj]), new Date(), req.user.id, Result.data.application_id]);
            res.status(200).json({ message: 'Status Updated Successfully' });

        } catch (error: any) {
            logger.error("ChangeApplicationStatus error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
            return;
        }
    }
    else {
        res.status(403).json({ message: 'You are not Authorized' });
        return;
    }
}

const getApprovedApplications = async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user.role === 'HR') {
      try {
        const { department, status, firstname, lastname, source_of_hire, jobs, round, updated_at, badges, page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        // Base query
        let baseQuery = `
          FROM applications a
            LEFT JOIN candidate c ON c.id = a.candidate_id
            LEFT JOIN users u ON u.id = c.userid
            LEFT JOIN interviews i ON i.application_id = a.id
            LEFT JOIN jobs j ON j.id = a.job_id
            WHERE 1=1
        `;
        
        const queryParams: any[] = [];
        
        // Status filtering logic - conditional based on whether status filter is applied
        if (status && status !== 'undefined') {
          // If specific status filter is provided, use that
          queryParams.push(status);
          baseQuery += ` AND a.status = $${queryParams.length}`;
        } else {
          // If no status filter, default to only "In Process" applications without scheduled interviews
          baseQuery += ` AND a.status = 'In Process' AND NOT EXISTS (
            SELECT 1 FROM interviews i2 
            WHERE i2.application_id = a.id 
              AND i2.status IN ('Scheduled', 'Rescheduled', 'Under Review', 'Ongoing')
          )`;
        }
        
        // Handle department filter
        if (department && department !== 'undefined') {
            // Convert the comma-separated string into an array
            const departmentsArray = (department as string).split(',').map(dep => dep.trim());
            
            // Create placeholders for each department value
            const placeholders = departmentsArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
            
            baseQuery += ` AND j.department IN (${placeholders})`;
            
            // Add each department as a separate parameter
            queryParams.push(...departmentsArray);
        }

        // Handle firstname filter
        if (firstname && firstname !== 'undefined') {
            // Add a LIKE condition for firstname search
            queryParams.push(`%${firstname}%`);
            baseQuery += ` AND c.firstname ILIKE $${queryParams.length}`;
        }

        // Handle lastname filter
        if (lastname && lastname !== 'undefined') {
            // Add a LIKE condition for firstname search
            queryParams.push(`%${lastname}%`);
            baseQuery += ` AND c.lastname ILIKE $${queryParams.length}`;
        }

        // Handle source_of_hire filter
        if (source_of_hire && source_of_hire !== 'undefined') {
            // Convert the comma-separated string into an array
            const sourceArray = (source_of_hire as string).split(',').map(dep => dep.trim());
            
            // Create placeholders for each department value
            const placeholders = sourceArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
            
            baseQuery += ` AND u.source IN (${placeholders})`;
            
            // Add each department as a separate parameter
            queryParams.push(...sourceArray);
        }

        // Handle source_of_hire filter
        if (jobs && jobs !== 'undefined') {
            // Convert the comma-separated string into an array
            const jobsArray = (jobs as string).split(',');
            
            // Create placeholders for each department value
            const placeholders = jobsArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
            
            baseQuery += ` AND j.title IN (${placeholders})`;
            
            // Add each department as a separate parameter
            queryParams.push(...jobsArray);
        }

        
        
        // Handle no of rounds
        if (round && round !== 'undefined') {
            // Convert into int - ensure round is treated as string first
            const roundValue = parseInt(round.toString(), 10);
            baseQuery += ` AND jsonb_array_length(a.selection_pipeline_id) > ${roundValue - 1}`;
        }

        // Handle department filter
        if (department && department !== 'undefined') {
            // Convert the comma-separated string into an array
            const departmentsArray = (department as string).split(',').map(dep => dep.trim());
            
            // Create placeholders for each department value
            const placeholders = departmentsArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
            
            baseQuery += ` AND j.department IN (${placeholders})`;
            
            // Add each department as a separate parameter
            queryParams.push(...departmentsArray);
        }

        // Handle Last updated_at
        if (updated_at && updated_at !== 'undefined') {
            // Parse the day count (e.g., 1 for last 1 day, 7 for last week, etc.)
            const dayCount = parseInt(updated_at.toString(), 10);
            
            // Get the current date/time
            const now = new Date();
          
            // Get the start of the day N days ago in UTC
            const startDate = new Date(now);
            startDate.setUTCHours(0, 0, 0, 0);
            startDate.setUTCDate(startDate.getUTCDate() - dayCount);
            
            // Use the current moment as the end of the range
            const endDate = now;
            
            // Append the condition to the query string using parameterized placeholders
            baseQuery += ` AND a.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' >= $${queryParams.length + 1} AND a.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' <= $${queryParams.length + 2}`;
            
            // Push the date boundaries into the query parameters
            queryParams.push(startDate.toISOString(), endDate.toISOString());
        }          
          
        // Handle badges filter
        if (badges && badges !== 'undefined') {
            // Convert the comma-separated string into an array of badge UUIDs
            const badgesArray = (badges as string).split(',').map(b => b.trim());
            // Create placeholders for the SQL query
            const placeholders = badgesArray
              .map((_, index) => `$${queryParams.length + index + 1}`)
              .join(', ');
              
            // Add a condition to ensure that the application has all matching badge
            baseQuery += ` AND (
              SELECT COUNT(*) FROM application_badges ab
              WHERE ab.application_id = a.id
                AND ab.badge_id IN (${placeholders})
            ) = ${badgesArray.length}`;
            
            // Append the badge UUIDs to the query parameters
            queryParams.push(...badgesArray);
        }

        const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM (
          SELECT DISTINCT ON (a.id) a.id
          ${baseQuery}
        ) AS filtered
      `;

        const countResult = await pool.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);

        const mainQuery = `
        SELECT DISTINCT ON (a.id)
            a.*, 
            i.id AS interview_id, 
            c.firstname || ' ' || c.lastname AS full_name,
            (
                SELECT COUNT(*) 
                FROM selection_pipeline sp 
                WHERE sp.job_id = j.id
            ) AS rounds,
            COALESCE(
            (
                SELECT json_agg(json_build_object('name', b.name, 'color', b.color))
                FROM application_badges ab
                JOIN badges b ON b.id = ab.badge_id
                WHERE ab.application_id = a.id
            ), '[]'
            ) AS badges
        ${baseQuery}
        ORDER BY a.id
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
        
        queryParams.push(Number(pageSize), offset);

        const Applications = await pool.query(mainQuery, queryParams);
        const totalPages = Math.ceil(totalCount / Number(pageSize));
        
        if (Applications.rowCount > 0) {
            res.status(200).json({ 
                message: 'Approved applications Fetched Successfully', 
                data: Applications.rows,
                pagination: {
                  page: Number(page),
                  pageSize: Number(pageSize),
                  totalCount,
                  totalPages
                }
              });;
        } else {
            res.status(204).json({ 
                message: "No Approved application found",
                pagination: {
                  page: Number(page),
                  pageSize: Number(pageSize),
                  totalCount: 0,
                  totalPages: 0
                }
              });;
        }
      } catch (error: any) {
        logger.error("GetApprovedApplication error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
      }
    } else {
      res.status(403).json({ message: 'You are not Authorized' });
    }
}
  
const getApplicationDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            res.status(400).send({message: "Invalid application id"})
            return;
        }

        const applicationResult = await pool.query(`
            SELECT a.*, c.userid 
            FROM applications a
            JOIN candidate c ON c.id = a.candidate_id
            WHERE a.id = $1`
        , [id]);
        
        if(applicationResult.rowCount === 0) {
            res.status(404).json({ message: "Application not found" });
            return;
        }

        const application = applicationResult.rows[0];

        const isAuthorized = req.user &&
        (application.userid === req.user.id || req.user.role === 'HR' || req.user.role === 'Interviewer');

        if (!isAuthorized) {
            res.status(403).json({ message: "You are not authorized" });
            return;
        }

        res.status(200).json({ message: "Application Details Fetched Successfully", data: application });

    } catch (error: any) {
        logger.error("GetApplicationDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getNextStageDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const applicationResult = await pool.query(`SELECT * from applications WHERE id = $1`, [id]);
        const candidateResult = await pool.query(`SELECT userid from candidate WHERE id = $1`, [applicationResult.rows[0].candidate_id]);
        
        // array of interviews will given by the candidate
        const selectionPipelineId = applicationResult.rows[0].selection_pipeline_id;
        
        let selectionPipelineResult = null;

        // if the first round of an candidadate
        if (selectionPipelineId === null) {
            selectionPipelineResult = await pool.query(
                `SELECT * FROM selection_pipeline
                WHERE job_id = $1 ORDER BY sequence ASC LIMIT 1`, [applicationResult.rows[0].job_id]);
        }
        else {
            selectionPipelineResult = await pool.query(
                `SELECT * 
                    FROM public.selection_pipeline
                    WHERE id <> ALL ($1) AND job_id = $2
                    ORDER BY sequence ASC
                    LIMIT 1;`,
                [selectionPipelineId, applicationResult.rows[0].job_id]
            );
        }
        // Check if the user is authorized
        if (req.isAuthenticated() &&
            (candidateResult.rows[0].userid === req.user.id || req.user.role === 'HR' || req.user.role === 'Interviewer')) {
            const nextStage = selectionPipelineResult.rows[0];
            res.status(200).json({ message: 'Next Stage Details Fetched Successfully', nextStage });
        } else {
            res.status(403).json({ message: 'You are not Authorized' });
        }

    } catch (error: any) {
        logger.error("GetNextStage error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
        return;
    }
}

const getHiringTrends = async (req: Request, res: Response) => {
    try {
        if (req.isAuthenticated() && req.user.role === 'HR') {
            const TrendsResult = await pool.query(
                `
                SELECT 
                TO_CHAR(applied_at, 'Mon') AS month,    -- Formats month as "Jan", "Feb", etc.
                COUNT(*) AS applications,         -- Total applications per month
                SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) AS hired  -- Count only "hired" applications
                FROM applications
                WHERE applied_at >= NOW() - INTERVAL '1 year'  -- Get data for the past year
                GROUP BY TO_CHAR(applied_at, 'Mon'), EXTRACT(MONTH FROM applied_at)
                ORDER BY EXTRACT(MONTH FROM applied_at);  -- Ensure months are sorted correctly
                `
            )
            res.status(200).json({ message: 'Hiring Trends Fetched Successfully', data: TrendsResult.rows });
            return;
        }
        else {
            res.status(403).json({ message: 'You are not Authorized get Hiring Trends' });
            return;
        }

    } catch (error: any) {
        logger.error("GetHiring Trends error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
        return;
    }
}

const getAdvanceFilterInfo = async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user.role === 'HR') {
        try {
        // Fetch candidate and badge data in parallel
        const [candidateResult, badgeResult, userResult] = await Promise.all([
          pool.query(`SELECT firstname, lastname FROM candidate`),
          pool.query(`SELECT id, color, name FROM badges`),
          pool.query(`SELECT DISTINCT source FROM users`),
        ]);
        
        res.status(200).json({
          message: "Candidate Info Successfully fetched", 
          data: {
            candidates: candidateResult.rows,
            badges: badgeResult.rows,
            users: userResult.rows,
          }
        });
        } catch (error: any) {
          logger.error("getAdvanceFilterInfo error:", error);
          res.status(500).json({ message: error.message || "Internal Server Error" });
        }
      } else {
        res.status(403).json({ message: 'You are not Authorized' });
      }
}

export {
    createApplication,
    getUserApplications,
    getAllPendingApplications,
    changeApplicationStatus,
    getApprovedApplications,
    getApplicationDetails,
    getNextStageDetails,
    getHiringTrends,
    getAdvanceFilterInfo
};
