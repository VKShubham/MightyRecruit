import { Request, Response } from "express";
import pool from "../config/db";
import logger from "../utils/logger";
import sendMail from "../utils/mailer";
import { CancelInterviewSchema, interViewSchema, setInterviewFeedbackSchema, updateInterviewAllDetailsSchema, updateInterviewerAndTimeDetailsSchema, updateInterviewerDetailsSchema, UpdateResultSchema, updateTimeDetailsSchema } from "../validators/zod";
import { CandidateCancellationTemplate, CandidateRescheduleTemplate, CandidateScheduleTemplate, InterviewerCancellationTemplate, InterviewerRescheduleTemplate, InterviewerScheduleTemplate } from "../utils/mail_template";

const createInterview = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Result = interViewSchema.safeParse(req.body);
            if(Result.success) {
                const { application_id, interviewer_id, candidate_id, scheduled_at, meeting_link, status, selection_pipeline_id } = Result.data;

                await client.query('BEGIN');

                // create an interview
                const InterviewResult = await client.query(
                    `INSERT INTO interviews (application_id, interviewer_id, scheduled_at, updated_at, created_by, updated_by, meeting_link, status, selection_pipeline_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    [application_id, interviewer_id, new Date(scheduled_at), new Date(), req.user.id, req.user.id, meeting_link, status, selection_pipeline_id]
                );

                // for tracking interview through application
                await client.query(
                    `UPDATE applications SET selection_pipeline_id = COALESCE(selection_pipeline_id, '[]'::jsonb) || $1::jsonb, updated_at = $3, updated_by = $4 WHERE id = $2`,
                    [JSON.stringify(selection_pipeline_id), application_id, new Date(), req.user.id]
                );
            
                // get details for sending an email
                const [candidateResult, interviewerResult, jobResult, pipelineResult] = await Promise.all([
                    client.query(`SELECT u.email, c.firstname || ' ' || c.lastname AS fullname FROM candidate c JOIN users u ON c.userid = u.id WHERE c.id = $1`, [candidate_id]),
                    client.query(`SELECT email, username FROM users WHERE id = $1`, [interviewer_id]),
                    client.query(`SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1`, [application_id]),
                    client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id])
                ]);

                if (candidateResult.rowCount === 0 || interviewerResult.rowCount === 0 || jobResult.rowCount === 0 || pipelineResult.rowCount === 0) {
                    await client.query('ROLLBACK');
                    res.status(404).json({ message: 'Invalid candidate, interviewer, job, or selection pipeline' });
                    return;
                }

                const { email: candidateEmail, fullname: candidateName } = candidateResult.rows[0];
                const { email: interviewerEmail, username: interviewerName } = interviewerResult.rows[0];
                const { title: jobTitle } = jobResult.rows[0];
                const { stage_name } = pipelineResult.rows[0];
                const interviewer_link = `http://localhost:5173/interview/${InterviewResult.rows[0].id}`;
               
                await sendMail(candidateEmail, 'Interview Scheduled', CandidateScheduleTemplate(candidateName, scheduled_at, jobTitle, stage_name, meeting_link));
                await sendMail(interviewerEmail, 'Interview Assignment', InterviewerScheduleTemplate(interviewerName, candidateName, scheduled_at, jobTitle, stage_name, interviewer_link));

                await client.query('COMMIT');
                res.status(200).json({ message: 'Interview created successfully' });
            }
            else {
                res.status(400).json({message: 'Pass the valid info'})
            }
        }
        else {
            res.status(403).json({message: 'You are not Authorized'});
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("CreateInterview error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
}

const getInterviewDetails = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && (req.user.role === 'Interviewer' || req.user.role === 'HR')) {
            const interviewid = req.params.id;
            if(!interviewid) {
                res.status(400).send({message: "Invalid Interview id"})
                return;
            }

            const InterviewResult = await pool.query(`SELECT * FROM interviews WHERE id = $1`, [interviewid]);
            if(InterviewResult.rowCount <= 0) {
                res.status(404).json({message: "Interview doesn't exist"});
                return;
            }
            const application_id = InterviewResult.rows[0].application_id;
            const ApplicationResult = await pool.query(`SELECT * FROM applications WHERE id = $1`, [application_id]);
            
            // Get all stages for this job to check if it's the last round
            const SelectionPipelineResult = await pool.query(`SELECT * FROM selection_pipeline WHERE job_id = $1`, [ApplicationResult.rows[0].job_id]);
            const allStages = SelectionPipelineResult.rows;
            const currentStageIndex = allStages.findIndex(
                (stage: any) => stage.id === InterviewResult.rows[0].selection_pipeline_id
            );
            let isFinalRound = false;
            if (currentStageIndex === allStages.length - 1) {
                isFinalRound = true;
            }

            if(InterviewResult.rowCount > 0) {
                const interviewerid = InterviewResult.rows[0].interviewer_id;
                if(interviewerid === req.user.id || req.user.role === 'HR') {
                    res.status(200).json({message: 'Interview details fetched succesfully', data: {
                        Interview : {
                            ...InterviewResult.rows[0],
                            isFinalRound
                        },
                        Application: ApplicationResult.rows[0]
                    }})
                    return;
                }
                else {
                    res.status(403).json({message: 'You are not Authorized'})
                }
            }
            else {
                res.status(404).json({message: 'No Details Found'});
            }
        }
        else {
            res.status(403).json({message: 'You are not Authorized'});
            return;
        }
    } catch (error: any) {
        logger.error("getInteviewDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
        return;
    }
}

const setInterviewFeedback = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if(req.isAuthenticated() && req.user.role === 'Interviewer') {

            const Result = setInterviewFeedbackSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send({message: "Provide valid details"})
                return;
            }

            const { application_id, feedbackData, interview_id, selection_pipeline_id } = Result.data;

            const SelectionPipelineResult = await client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id]);
            
            const noteObj = {
                created_by: req.user.username,
                created_at: new Date(),
                notes: feedbackData.notes,
                title: SelectionPipelineResult.rows[0].stage_name,
            }
            
            await client.query('BEGIN');
            await client.query(`UPDATE interviews SET feedback = $1, status = $2 WHERE id = $3`, [feedbackData, 'Under Review', interview_id]);
            await client.query(`UPDATE applications SET notes = COALESCE(notes, '[]'::jsonb) || $1::jsonb , updated_by = $2, updated_at = $3 WHERE id = $4`, [JSON.stringify([noteObj]), req.user.id, new Date(), application_id]);
            await client.query('COMMIT');
            res.status(200).send({message: 'Feedback sent'})
        }
        else {
            res.status(403).json({message: 'You are not Authorized'})
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("setInterviewDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
}

const getHRInterviews = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
           const { HRInterviews = true, firstname, lastname, interviewers, department, job_title, badges, scheduled_at, status, interview_type, source_of_hire, page = 1, pageSize = 10 } = req.query;
           const offset = (Number(page) - 1) * Number(pageSize);
           // Base query
           let baseQuery = `
                FROM interviews i
                LEFT JOIN users iu ON iu.id = i.interviewer_id
                LEFT JOIN applications a ON a.id = i.application_id
                LEFT JOIN candidate c ON c.id = a.candidate_id
                LEFT JOIN jobs j ON j.id = a.job_id
                LEFT JOIN selection_pipeline sp ON j.id = sp.job_id
                WHERE 1=1
           `

           const queryParams: any[] = [];

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
                // For firstname, use LIKE for partial matching
                queryParams.push(`%${firstname}%`);
                baseQuery += ` AND c.firstname ILIKE $${queryParams.length}`;
            }

            // Handle scheduled_at filter
            if (scheduled_at && scheduled_at !== 'undefined') {
                const dateStr = scheduled_at as string;
                
                try {
                    // Parse the date string into a Date object
                    const filterDate = new Date(dateStr);
                    
                    // Make sure it's a valid date
                    if (!isNaN(filterDate.getTime())) {
                        // Format for start and end of the day in UTC
                        const startDate = new Date(filterDate);
                        startDate.setUTCHours(0, 0, 0, 0);
                        
                        const endDate = new Date(filterDate);
                        endDate.setUTCHours(23, 59, 59, 999);
                        
                        queryParams.push(startDate, endDate);
                        baseQuery += ` AND i.scheduled_at >= $${queryParams.length - 1} AND i.scheduled_at <= $${queryParams.length}`;
                    }
                } catch (error) {
                    logger.error("Error parsing scheduled_at date:", error);
                    // Don't add the filter if the date is invalid
                }
            }

            // Handle lastname filter
            if (lastname && lastname !== 'undefined') {
               // For lastname, use LIKE for partial matching
               queryParams.push(`%${lastname}%`);
               baseQuery += ` AND c.lastname ILIKE $${queryParams.length}`;
            }


           // handle HR Created Interviews
           if(HRInterviews) {
                queryParams.push(req.user.id);
                baseQuery += ` AND i.created_by = $${queryParams.length}`
           }

           // Handle department filter
            if (interviewers && interviewers !== 'undefined') {
                // Convert the comma-separated string into an array
                const InterviewersArray = (interviewers as string).split(',').map(dep => dep.trim());
                
                // Create placeholders for each department value
                const placeholders = InterviewersArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                
                baseQuery += ` AND i.interviewer_id IN (${placeholders})`;
                
                // Add each department as a separate parameter
                queryParams.push(...InterviewersArray);
            }

            if (job_title && job_title !== 'undefined') {
                // Convert the comma-separated string into an array
                const   jobArray = (job_title as string).split(',').map(dep => dep.trim());
                
                // Create placeholders for each department value
                const placeholders = jobArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                
                baseQuery += ` AND j.id IN (${placeholders})`;
                
                // Add each department as a separate parameter
                queryParams.push(...jobArray);
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

            // Handle status Filter
            if (status && status !== 'undefined') {
                // Convert the comma-separated string into an array
                const   statusArray = (status as string).split(',').map(dep => dep.trim());
                
                // Create placeholders for each department value
                const placeholders = statusArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                
                baseQuery += ` AND i.status IN (${placeholders})`;
                
                // Add each department as a separate parameter
                queryParams.push(...statusArray);
            }

            // Handle Interview Type Filter
            if (interview_type && interview_type !== 'undefined') {
                // Convert the comma-separated string into an array
                const   interviewTypeArray = (interview_type as string).split(',').map(dep => dep.trim());
                
                // Create placeholders for each department value
                const placeholders = interviewTypeArray.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                
                baseQuery += ` AND sp.stage_name IN (${placeholders})`;
                
                // Add each department as a separate parameter
                queryParams.push(...interviewTypeArray);
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

            const countQuery = `
            SELECT COUNT(*) AS total_count
            FROM (
                SELECT DISTINCT ON (i.id) i.id
                ${baseQuery}
            ) AS filtered
            `;

            const countResult = await pool.query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0].total_count, 10);

            const mainQuery = `
                SELECT DISTINCT ON (i.id)
                i.id, 
                c.firstname || ' ' || c.lastname AS fullName,
                iu.username AS interviewer,
                i.scheduled_at,
                i.status,
                j.title,
                COALESCE(
                (
                    SELECT json_agg(json_build_object('name', b.name, 'color', b.color))
                    FROM application_badges ab
                    JOIN badges b ON b.id = ab.badge_id
                    WHERE ab.application_id = a.id
                ), '[]'
                ) AS badges
                ${baseQuery}
                LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
            `

            queryParams.push(Number(pageSize), offset);

            const Interviews = await pool.query(mainQuery, queryParams);
            const totalPages = Math.ceil(totalCount / Number(pageSize));

            if (Interviews.rowCount > 0) {
                res.status(200).json({ 
                    message: 'Interviews Fetched Successfully', 
                    data: Interviews.rows,
                    pagination: {
                      page: Number(page),
                      pageSize: Number(pageSize),
                      totalCount,
                      totalPages
                    }
                  });
            } else {
                res.status(204).json({ 
                    message: "No Interviews found",
                    pagination: {
                      page: Number(page),
                      pageSize: Number(pageSize),
                      totalCount: 0,
                      totalPages: 0
                    }
                  });
            }
        }
        else {
            res.status(403).json({message: 'You are not Authorized'})
        }
    } catch (error: any) {
        logger.error("GetHRInterviews error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getInterviewRelatedDetails = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const interviewid = req.params.id;
            if(!interviewid) {
                res.status(400).send({message: "Invalid Interview id"})
                return;
            }

            const InterviewResult = await pool.query(
                `SELECT i.*, uc.username AS created_by_name, u.email AS candidate_email, c.phone,
                a.candidate_id, c.firstname || ' ' || c.lastname AS candidate_name, u.username AS interviewer_username, s.stage_name
                FROM interviews i
                JOIN applications a ON i.application_id = a.id
                LEFT JOIN users u ON i.interviewer_id = u.id
                LEFT JOIN users uc ON i.created_by = uc.id
                LEFT JOIN selection_pipeline s ON i.selection_pipeline_id = s.id
                LEFT JOIN candidate c ON a.candidate_id = c.id
                WHERE i.id = $1`
                , [interviewid]);

            if(InterviewResult.rowCount <= 0) {
                res.status(404).json({message: "Interview doesn't exist"});
                return;
            }
            else {
                res.status(200).json({message: "Interview details fetched successfully", data: InterviewResult.rows});
                return;
            }
        } else {
            res.status(403).json({message: 'You are not Authorized'})
            return;
        }
    } catch (error: any) {
        logger.error("getInterviewRelated Details error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const updateAllDetails = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Result = updateInterviewAllDetailsSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send("Provide valid details")
                return;
            }

            const { interview_id, scheduled_at, interviewer_id, meeting_link, status_change_reason } = Result.data;

            const oldInterviewerResult = await client.query(
                `
                SELECT u.email, u.username FROM users u 
                JOIN interviews i ON i.interviewer_id = u.id
                WHERE i.id = $1
                `, [interview_id]
            )
            await client.query('BEGIN');
            const updateResult = await client.query(
                `UPDATE interviews SET scheduled_at = $1, interviewer_id = $2, meeting_link = $3, updated_at = $4, updated_by = $5, status_change_reason = $6, status = $8 WHERE id = $7 RETURNING application_id, selection_pipeline_id`,
                [scheduled_at, interviewer_id, meeting_link, new Date(), req.user.id, status_change_reason, interview_id, 'Rescheduled']
            );

            if (updateResult.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ message: 'Interview not found' })
                return;
            }

            const { application_id , selection_pipeline_id } = updateResult.rows[0];

             // get details for sending an email
             const [candidateResult, interviewerResult, jobResult, pipelineResult] = await Promise.all([
                client.query(`SELECT u.email, c.firstname || ' ' || c.lastname AS fullname FROM candidate c JOIN users u ON c.userid = u.id JOIN applications a ON a.candidate_id = c.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT email, username FROM users WHERE id = $1`, [interviewer_id]),
                client.query(`SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id])
            ]);

            if (candidateResult.rowCount === 0 || interviewerResult.rowCount === 0 || jobResult.rowCount === 0 || pipelineResult.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ message: 'Invalid candidate, interviewer, job, or selection pipeline' });
                return;
            }

            const { email: candidateEmail, fullname: candidateName } = candidateResult.rows[0];
            const { email: interviewerEmail, username: interviewerName } = interviewerResult.rows[0];
            const { email: oldinterviewerEmail, username: oldinterviewerName } = oldInterviewerResult.rows[0];
            const { title: jobTitle } = jobResult.rows[0];
            const { stage_name } = pipelineResult.rows[0];
            const interviewer_link = `http://localhost:5173/interview/${interview_id}`;
           
            await sendMail(candidateEmail, 'Interview Rescheduled', CandidateScheduleTemplate(candidateName, scheduled_at, jobTitle, stage_name, meeting_link));
            await sendMail(oldinterviewerEmail, 'Interview Assignment Cancelled', InterviewerCancellationTemplate(oldinterviewerName, candidateName, scheduled_at, jobTitle, stage_name));
            await sendMail(interviewerEmail, 'Interview Assignment', InterviewerScheduleTemplate(interviewerName, candidateName, scheduled_at, jobTitle, stage_name, interviewer_link));
            
            await client.query('COMMIT');
            res.status(200).json({ message: 'Interview details updated successfully' });
        } else {
            res.status(403).json({message: 'You are not Authorized'})
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("updateAllDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
}

const updateInterviewerDetails = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Result = updateInterviewerDetailsSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send("Provide valid details")
                return;
            }
            
            const { interviewer_id, interview_id, status_change_reason } = Result.data;
            
            const oldInterviewerResult = await client.query(
                `
                SELECT u.email, u.username FROM users u 
                JOIN interviews i ON i.interviewer_id = u.id
                WHERE i.id = $1
                `, [interview_id]
            )
            await client.query('BEGIN');
            const updateResult = await client.query(
                `UPDATE interviews SET interviewer_id = $1, updated_at = $2, updated_by = $3, status_change_reason = $4 WHERE id = $5
                RETURNING scheduled_at, application_id, selection_pipeline_id`,
                [interviewer_id, new Date(), req.user.id, status_change_reason, interview_id]
            );

            const {application_id , selection_pipeline_id} = updateResult.rows[0];

            const [candidateResult, interviewerResult, jobResult, pipelineResult] = await Promise.all([
                client.query(`SELECT c.firstname || ' ' || c.lastname AS fullname FROM candidate c JOIN users u ON c.userid = u.id JOIN applications a ON a.candidate_id = c.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT email, username FROM users WHERE id = $1`, [interviewer_id]),
                client.query(`SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id])
            ]);

            if (candidateResult.rowCount === 0 || interviewerResult.rowCount === 0 || jobResult.rowCount === 0 || pipelineResult.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ message: 'Invalid candidate, interviewer, job, or selection pipeline' });
                return;
            }

            const { fullname: candidateName } = candidateResult.rows[0];
            const { email: interviewerEmail, username: interviewerName } = interviewerResult.rows[0];
            const { email: oldinterviewerEmail, username: oldinterviewerName } = oldInterviewerResult.rows[0];
            const { title: jobTitle } = jobResult.rows[0];
            const { stage_name } = pipelineResult.rows[0];
            const interviewer_link = `http://localhost:5173/interview/${interview_id}`;
            const { scheduled_at } = updateResult.rows[0];

            await sendMail(oldinterviewerEmail, 'Interview Assignment Cancelled', InterviewerCancellationTemplate(oldinterviewerName, candidateName, scheduled_at, jobTitle, stage_name));
            await sendMail(interviewerEmail, 'Interview Assignment', InterviewerScheduleTemplate(interviewerName, candidateName, scheduled_at, jobTitle, stage_name, interviewer_link));

            await client.query('COMMIT');
            res.status(200).json({ message: 'Interviewer details updated successfully' });
        } else {
            res.status(403).json({message: 'You are not Authorized'})
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("updateInterviewerDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
}

const updateTimeDetails = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Result = updateTimeDetailsSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send("Provide valid details")
                return;
            }

            const { interview_id, scheduled_at, status_change_reason } = Result.data;
            
            const oldInterviewResult = await client.query(
                `
                SELECT scheduled_at FROM interviews WHERE id = $1
                `, [interview_id]
            )

            await client.query('BEGIN');

            const updateResult = await client.query(
                `UPDATE interviews 
                 SET scheduled_at = $1, updated_at = $2, updated_by = $3, 
                     status_change_reason = $4, status = $5 
                 WHERE id = $6 RETURNING scheduled_at, application_id, selection_pipeline_id, interviewer_id, meeting_link`,
                [scheduled_at, new Date(), req.user.id, status_change_reason, 'Rescheduled', interview_id]
            );

            const { application_id , selection_pipeline_id, interviewer_id, meeting_link } = updateResult.rows[0];

            const [candidateResult, interviewerResult, jobResult, pipelineResult] = await Promise.all([
                client.query(`SELECT u.email, c.firstname || ' ' || c.lastname AS fullname FROM candidate c JOIN users u ON c.userid = u.id JOIN applications a ON a.candidate_id = c.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT email, username FROM users WHERE id = $1`, [interviewer_id]),
                client.query(`SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id])
            ]);

            if (candidateResult.rowCount === 0 || interviewerResult.rowCount === 0 || jobResult.rowCount === 0 || pipelineResult.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ message: 'Invalid candidate, interviewer, job, or selection pipeline' });
                return;
            }  
            
            const { email: candidateEmail ,fullname: candidateName } = candidateResult.rows[0];
            const { email: interviewerEmail, username: interviewerName } = interviewerResult.rows[0];
            const { title: jobTitle } = jobResult.rows[0];
            const { stage_name } = pipelineResult.rows[0];
            const interviewer_link = `http://localhost:5173/interview/${interview_id}`;
            const { scheduled_at: old_scheduled_at } = oldInterviewResult.rows[0];
        
            sendMail(interviewerEmail, 'Interview Assignment Rescheduled', InterviewerRescheduleTemplate(interviewerName, candidateName, old_scheduled_at, scheduled_at, jobTitle, stage_name, status_change_reason, interviewer_link));
            sendMail(candidateEmail, 'Interview Rescheduled', CandidateRescheduleTemplate(candidateName, old_scheduled_at, scheduled_at, jobTitle, stage_name, "", meeting_link));

            await client.query('COMMIT');
            res.status(200).json({ message: 'Interview time updated successfully' });
        } else {
            res.status(403).json({message: 'You are not Authorized'})
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("updateTimeDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
    finally {
        client.release();
    }
}

const updateInterviewerAndTimeDetails = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Result = updateInterviewerAndTimeDetailsSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send("Provide valid details")
                return;
            }

            const { interviewer_id, interview_id, scheduled_at, status_change_reason } = Result.data;

            const [oldInterviewerResult, oldInterviewResult] = await Promise.all([
                client.query(
                    `
                    SELECT u.email, u.username FROM users u 
                    JOIN interviews i ON i.interviewer_id = u.id
                    WHERE i.id = $1
                    `, [interview_id]
                ),
                client.query(
                    `
                    SELECT scheduled_at FROM interviews
                    WHERE id = $1
                    `, [interview_id]
                )
            ]);

            await client.query('BEGIN');
            const updateResult = await client.query(
                `UPDATE interviews SET interviewer_id = $1, scheduled_at = $2, updated_at = $3, updated_by = $4, status_change_reason = $5, status = $7 WHERE id = $6  RETURNING application_id, selection_pipeline_id, meeting_link`,
                [interviewer_id, scheduled_at, new Date(), req.user.id, status_change_reason, interview_id, 'Rescheduled']
            );

            const { application_id , selection_pipeline_id, meeting_link } = updateResult.rows[0];

            const [candidateResult, interviewerResult, jobResult, pipelineResult] = await Promise.all([
                client.query(`SELECT u.email, c.firstname || ' ' || c.lastname AS fullname FROM candidate c JOIN users u ON c.userid = u.id JOIN applications a ON a.candidate_id = c.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT email, username FROM users WHERE id = $1`, [interviewer_id]),
                client.query(`SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id])
            ]);

            if (candidateResult.rowCount === 0 || interviewerResult.rowCount === 0 || jobResult.rowCount === 0 || pipelineResult.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ message: 'Invalid candidate, interviewer, job, or selection pipeline' });
                return;
            }

            const { email: candidateEmail, fullname: candidateName } = candidateResult.rows[0];
            const { email: interviewerEmail, username: interviewerName } = interviewerResult.rows[0];
            const { email: oldinterviewerEmail, username: oldinterviewerName } = oldInterviewerResult.rows[0];
            const { title: jobTitle } = jobResult.rows[0];
            const { stage_name } = pipelineResult.rows[0];
            const { scheduled_at: old_scheduled_at } = oldInterviewResult.rows[0];
            const interviewer_link = `http://localhost:5173/interview/${interview_id}`;

            await sendMail(oldinterviewerEmail, 'Interview Assignment Cancelled', InterviewerCancellationTemplate(oldinterviewerName, candidateName, scheduled_at, jobTitle, stage_name));
            await sendMail(interviewerEmail, 'Interview Assignment', InterviewerScheduleTemplate(interviewerName, candidateName, scheduled_at, jobTitle, stage_name, interviewer_link));
            sendMail(candidateEmail, 'Interview Rescheduled', CandidateRescheduleTemplate(candidateName, old_scheduled_at, scheduled_at, jobTitle, stage_name, "", meeting_link));

            await client.query('COMMIT');
            res.status(200).json({ message: 'Interviewer and time details updated successfully' });
        } else {
            res.status(403).json({message: 'You are not Authorized'})
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("updateInterviewerAndTimeDetails error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
}

const cancelInterview = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if (req.isAuthenticated() && req.user.role === 'HR') {
            const Result = CancelInterviewSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send("Provide valid details")
                return;
            }

            const { interview_id, status_change_reason } = Result.data;

            const interviewResult = await client.query(`SELECT selection_pipeline_id, application_id, interviewer_id, scheduled_at  FROM interviews WHERE id = $1`, [interview_id]);
            if (interviewResult.rowCount <= 0) {
                res.status(404).json({ message: "Interview doesn't exist" });
                return;
            }

            const { application_id , selection_pipeline_id, meeting_link, interviewer_id, scheduled_at } = interviewResult.rows[0];

            await client.query('BEGIN');
            await client.query(
                `UPDATE applications SET selection_pipeline_id = selection_pipeline_id - $1::text WHERE id = $2`,
                [selection_pipeline_id, application_id]
            );
            await client.query(
                `UPDATE interviews SET status = $1, status_change_reason = $2, updated_at = $3, updated_by = $4 WHERE id = $5`,
                ['Cancelled', status_change_reason, new Date(), req.user.id, interview_id]
            );

            const [candidateResult, interviewerResult, jobResult, pipelineResult] = await Promise.all([
                client.query(`SELECT u.email, c.firstname || ' ' || c.lastname AS fullname FROM candidate c JOIN users u ON c.userid = u.id JOIN applications a ON a.candidate_id = c.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT email, username FROM users WHERE id = $1`, [interviewer_id]),
                client.query(`SELECT j.title FROM jobs j JOIN applications a ON a.job_id = j.id WHERE a.id = $1`, [application_id]),
                client.query(`SELECT stage_name FROM selection_pipeline WHERE id = $1`, [selection_pipeline_id])
            ]);

            if (candidateResult.rowCount === 0 || interviewerResult.rowCount === 0 || jobResult.rowCount === 0 || pipelineResult.rowCount === 0) {
                await client.query('ROLLBACK');
                res.status(404).json({ message: 'Invalid candidate, interviewer, job, or selection pipeline' });
                return;
            }

            const { email: candidateEmail, fullname: candidateName } = candidateResult.rows[0];
            const { email: interviewerEmail, username: interviewerName } = interviewerResult.rows[0];
            const { title: jobTitle } = jobResult.rows[0];
            const { stage_name } = pipelineResult.rows[0];

            await sendMail(interviewerEmail, 'Interview Assignment Canclled', InterviewerCancellationTemplate(interviewerName, candidateName, scheduled_at, jobTitle, stage_name))
            await sendMail(candidateEmail, "Interview Cancelled", CandidateCancellationTemplate(candidateName, scheduled_at, jobTitle, stage_name))
            
            await client.query('COMMIT');
            res.status(200).json({ message: 'Interview cancelled successfully' });
        } else {
            res.status(403).json({ message: 'You are not Authorized' });
        }
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("cancelInterview error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    } finally {
        client.release();
    }
}

const DeleteInterview = async (req: Request, res: Response) => {
    try {
        if (req.isAuthenticated() && req.user.role === 'HR') {
            const id = req.params.id;
            await pool.query(`DELETE FROM interviews WHERE id = $1`, [id]);
            res.status(200).json({ message: 'Interview deleted successfully' });
        } else {
            res.status(403).json({ message: 'You are not Authorized' });
        }
    } catch (error: any) {
        logger.error("cancelInterview error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const UpdateResult = async (req: Request, res: Response) => {
    try {
        if (req.isAuthenticated() && req.user.role === 'HR') {

            const Result = UpdateResultSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send({message: "Please pass the valid info"})
                return;
            }

            const { interview_id, result } = Result.data;
            
            if(result === 'Pass') {
                
                // Get application_id and selection_pipeline_id from the interviews table
                const interviewData = await pool.query(
                    `SELECT application_id, selection_pipeline_id 
                    FROM interviews 
                    WHERE id = $1`,
                    [interview_id]
                );

                if (interviewData.rows.length === 0) {
                    res.status(404).json({ message: 'Interview not found' });
                    return;
                }
        
                const { application_id, selection_pipeline_id } = interviewData.rows[0];

                const lastStageQuery = await pool.query(
                    `SELECT id 
                     FROM selection_pipeline 
                     WHERE job_id = (SELECT job_id FROM applications WHERE id = $1) 
                     ORDER BY sequence DESC LIMIT 1`,
                    [application_id]
                );
        
                if (lastStageQuery.rows.length === 0) {
                    await pool.query('ROLLBACK');
                    res.status(404).json({ message: 'Selection pipeline not found' })
                    return;
                }
        
                const lastSelectionPipelineId = lastStageQuery.rows[0].id;
                const JobID = lastStageQuery.rows[0].job_id;
                // Check if this is the final round
                const isFinalRound = selection_pipeline_id === lastSelectionPipelineId;
                
                await pool.query('BEGIN');
                await pool.query(
                    `UPDATE interviews SET result = $1, status = $2, updated_at = $3, updated_by = $4 WHERE id = $5`,
                    ['Pass', 'Completed', new Date(), req.user.id, interview_id]
                );
                if(isFinalRound) {
                    await pool.query(
                        `UPDATE applications 
                         SET status = $1, updated_at = $2, updated_by = $3 
                         WHERE id = $4`,
                        ['Hired', new Date(), req.user.id, application_id]
                    );
                    await pool.query(
                        `UPDATE jobs SET total_hired = total_hired + 1 WHERE id = $1`,
                        [JobID]
                    )
                }
                await pool.query('COMMIT');
                res.status(200).json({ message: 'Interview result updated successfully' });
                return;
            }
            else {
                await pool.query('BEGIN');
                await pool.query(
                    `UPDATE interviews SET result = $1, status = $2, updated_at = $3, updated_by = $4 WHERE id = $5`,
                    ['Fail', 'Completed', new Date(), req.user.id, interview_id]
                );
                
                const applicationResult = await pool.query(`SELECT application_id FROM interviews WHERE id = $1`, [interview_id]);
                const application_id = applicationResult.rows[0].application_id;
                await pool.query(`UPDATE applications SET status = 'Rejected', updated_at = $1, updated_by = $2  WHERE id = $3`, [new Date(), req.user.id, application_id]);
                await pool.query('COMMIT');
                res.status(200).json({ message: 'Interview result updated successfully' });
                return;
            }
        } else {
            await pool.query('ROLLBACK');
            res.status(403).json({ message: 'You are not Authorized' });
            return;
        }
    } catch (error: any) {
        await pool.query('ROLLBACK');
        logger.error("cancelInterview error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
        return;
    }
}

const getUpcComingInterview = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
           const InterviewResult = await pool.query(
            `SELECT i.scheduled_at AS time, c.firstname || ' ' || c.lastname AS candidate, c.profile_picture_url AS avatar, j.title AS role
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN candidate c ON a.candidate_id = c.id
            WHERE i.status = $1 OR i.status = $2 AND i.created_by = $3
            ORDER BY i.scheduled_at ASC LIMIT 2
            `
            ,['Rescheduled','Scheduled',req.user.id]);

           if(InterviewResult.rowCount > 0) {
                res.status(200).json({message: 'Interviews Fetched Succsufully', data: InterviewResult.rows})
            } else {
                res.status(204).json({message: 'No Interviews Found'})
           }
        }
        else {
            res.status(403).json({message: 'You are not Authorized to get UpComing Interviews'})
        }
    } catch (error: any) {
        logger.error("getUpComing Interviews error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
} 

const getAdvanceFilterInfo = async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user.role === 'HR') {
        try {
        // Fetch candidate and badge data in parallel
        const [candidateResult, badgeResult, userResult, InterviewerResult] = await Promise.all([
          pool.query(`SELECT firstname, lastname FROM candidate`),
          pool.query(`SELECT id, color, name FROM badges`),
          pool.query(`SELECT DISTINCT source FROM users`),
          pool.query(`SELECT username, id FROM users WHERE role = $1`, ['Interviewer']),
        ]);
        
        res.status(200).json({
          message: "Candidate Info Successfully fetched", 
          data: {
            candidates: candidateResult.rows,
            badges: badgeResult.rows,
            users: userResult.rows,
            Interviewer: InterviewerResult.rows,
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
    createInterview,
    getInterviewDetails,
    setInterviewFeedback,
    getHRInterviews,
    getInterviewRelatedDetails,
    updateAllDetails,
    updateInterviewerDetails,
    updateTimeDetails,
    updateInterviewerAndTimeDetails,
    cancelInterview,
    DeleteInterview,
    UpdateResult,
    getUpcComingInterview,
    getAdvanceFilterInfo
}