const { jobSchema } = require('../validators/zod'); 
import { Request, Response } from "express";
import pool from "../config/db";
import logger from "../utils/logger";
import { Job } from "../@types/job";
import { EditJobSchema } from "../validators/zod";

const createJob = async (req: Request, res: Response) => {
    if(req.isAuthenticated() && req.user.role === 'HR') {
        const client = await pool.connect();
        try {
            // it validates the data using zod schema
            const result = jobSchema.safeParse(req.body);
             
            // if data is invalid
            if(!result.success) {
                res.status(400).json({ message: 'Invalid input data', errors: result.error.errors });
                return;
            }

            // extracting safed parsed Data
            const data: Job = result.data;
            
            await client.query('BEGIN');

            // Insert into jobs
            const JobResult = await client.query(
                `INSERT INTO jobs (title, description, requirements, department, work_experience, status, created_by, updated_at, salary_range, shift_type, city, state, country, work_mode, updated_by, total_vacancy, total_hired) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
                [
                    data.title,
                    data.description,
                    data.requirements,
                    data.department,
                    parseInt(data.work_expierence),
                    data.status,
                    req.user.id,
                    new Date(),
                    data.salary_range,
                    data.shift_type,
                    data.city,
                    data.state,
                    data.country,
                    data.work_mode,
                    req.user.id,
                    parseInt(data.total_vacancy),
                    parseInt(data.total_hired)
                ]
            );

            const jobId = JobResult.rows[0].id;
            
            const selectionProcessArray = data.selection_process;
            const jobIds : string[] = [];
            const stageNames : string[] = [];
            const sequences : number[] = [];
            const updatedBys : any[] = [];
            const updatedAts : Date[] = [];

            selectionProcessArray.forEach((item: any) => {
                jobIds.push(jobId);
                stageNames.push(item.stage_name);
                sequences.push(parseInt(item.sequence));
                updatedBys.push(req.user.id);
                updatedAts.push(new Date(Date.now()));
            });

            //Insert Selection Process
            await client.query(
                `INSERT INTO selection_pipeline (job_id, stage_name, sequence, updated_by, updated_at) 
                 SELECT * FROM unnest($1::uuid[], $2::varchar[], $3::int[], $4::uuid[], $5::timestamp[])`,
                [jobIds, stageNames, sequences, updatedBys, updatedAts]
            );

            await client.query('COMMIT');
            res.status(200).json({ message: 'Job Created Successfully' });
            return;
        } catch (error: any) {
            await client.query('ROLLBACK');
            logger.error("CreateJob error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        } finally {
            client.release();
        }
    }
    else {
        res.status(403).json({message: 'You are not Authorized to Create a Job'});
    } 
}

const getJobs = async (req: Request, res: Response) => {
    try {
        const Jobs = await pool.query(
            `SELECT * FROM jobs WHERE status = $1`, ['Open']
        )
        res.status(200).json({ message: 'Job Fetched Successfully', jobs: Jobs.rows });
        return;
    } catch (error: any) {
        logger.error("GetJobs error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getAllJobs = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Jobs = await pool.query(
                `SELECT * FROM jobs`
            )
            res.status(200).json({ message: 'Job Fetched Successfully', jobs: Jobs.rows });
            return;
        }
        else {
            res.status(403).json({ message: 'You are not Authorized to view all jobs' });
        }
    } catch (error: any) {
        logger.error("GetJobs error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getRecentJobs = async (req: Request, res: Response) => {
    try {
       if(req.isAuthenticated() && req.user.role === 'HR') {
        const JobResult = await pool.query(
            `
            SELECT
            j.id,
            j.title, 
            j.department, 
            j.city || ', ' || j.state || ', ' || j.country AS location,
            j.salary_range AS salary,
            COUNT(a.id) AS applications,
            j.created_at AS posted,
            j.status
            FROM jobs j
            LEFT JOIN applications a ON a.job_id = j.id
            GROUP BY j.id LIMIT 3
            `
        );
        res.status(200).json({ 
            message: 'Recent Jobs Fetched Successfully', 
            jobs: JobResult.rows 
        });
        return;
       }
       else {
        res.status(403).json({ message: 'You are not Authorized to view Recent Jobs' });
       }
    } catch (error: any) {
        logger.error("RecentJobs error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getJobStats = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const StatsResult = await pool.query(
                `
                SELECT
                (SELECT COUNT(*) FROM applications) AS total_applications,
                ( 
                    SELECT COUNT(*) AS application_increment
                    FROM applications 
                    WHERE applied_at >= NOW() - INTERVAL '7 days'
                ),
                (SELECT COUNT(*) FROM interviews) AS total_interviews,
                (
                    SELECT COUNT(*) AS interview_increment
                    FROM interviews
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                ),
                (SELECT COUNT(*) FROM jobs) AS total_jobs,
                (
                    SELECT COUNT(*) AS job_increment
                    FROM jobs
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                ),
                (SELECT COUNT(*) FROM applications WHERE status = 'Hired') AS total_hired,
                (
                    SELECT COUNT(*) AS hired_increment
                    FROM applications
                    WHERE status = 'Hired' AND applied_at >= NOW() - INTERVAL '7 days'
                )
                `
            );
            res.status(200).json({ 
                message: 'Job Stats Fetched Successfully', 
                stats: StatsResult.rows[0] 
            });
            return;
        }
        else {
            res.status(403).json({ message: 'You are not Authorized to view Job Stats' });
        }
    } catch (error: any) {
        logger.error("GetJobStats error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            res.status(400).send({message: "Inavalid id"});
            return;
        }

        const JobResult = await pool.query(
            `SELECT * FROM jobs WHERE id = $1`,
            [id]
        );

        if (JobResult.rows.length === 0) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        res.status(200).json({ message: 'Job Fetched Successfully', job: JobResult.rows[0] });
    } catch (error: any) {
        logger.error("GetJobById error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const editJob = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
           const result = EditJobSchema.safeParse(req.body);

           if (!result.success) {
               res.status(400).json({ message: 'Invalid input data', errors: result.error.errors });
               return;
           }

           const data: any = result.data;
            await pool.query(
               `UPDATE jobs SET title = $1, description = $2, requirements = $3, department = $4, work_experience = $5, status = $6, updated_at = $7, salary_range = $8, shift_type = $9, city = $10, state = $11, country = $12, work_mode = $13, updated_by = $14, total_vacancy = $15 WHERE id = $16`,
               [
                   data.title,
                   data.description,
                   data.requirements,
                   data.department,
                   parseInt(data.work_expierence),
                   data.status,
                   new Date(),
                   data.salary_range,
                   data.shift_type,
                   data.city,
                   data.state,
                   data.country,
                   data.work_mode,
                   req.user.id,
                   parseInt(data.total_vacancy),
                   data.job_id
               ]
           );
           res.status(200).json({ message: 'Job Updated Successfully' });
        }
        else {
            res.status(403).json({ message: 'You are not Authorized to view Job Stats' });
        }
    } catch (error: any) {
        logger.error("EditJob error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

export {
    createJob,
    getJobs,
    getJobStats,
    getRecentJobs,
    getJobById,
    editJob,
    getAllJobs
}