import { Request, Response } from "express";
import pool from "../config/db";
import logger from "../utils/logger";
import { addInterviewerSchema } from "../validators/zod";

const addInterviewer = async(req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
            const Result = addInterviewerSchema.safeParse(req.body);

            
            if(!Result.success) {
                res.status(400).json({ message: 'Please pass the valid username and email'});
                return;
            }

            const { username, email }  = Result.data;

            await pool.query(`INSERT INTO users (username, email, password, role, updated_at, status ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    username,
                    email,
                    'Admin@2475',
                    'Interviewer',
                    new Date(),
                    'Active'
                ]
            )
            res.status(200).json({ message: 'User registered successfully' });
        }
        else {
            res.status(403).json({message: 'You are not Authorized to Create Interviewer'});
        }
    } catch (error: any) {
        logger.error("Registration error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getAllInterviewers = async (req: Request, res: Response) => {
    try {
        if(req.isAuthenticated() && req.user.role === 'HR') {
           const InterviewerResult = await pool.query(`SELECT * from users WHERE role = $1`, ['Interviewer']);
           res.status(200).json({message: 'Interviewers Fetched Succesfully', data: InterviewerResult.rows})
        }
        else {
            res.status(403).json({message: 'You are not Authorized to Apply For a Job'});
        }
    } catch (error: any) {
        logger.error("Registration error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const getAvailableInterviewer = async (req: Request, res: Response) => {
    try {
        if (req.isAuthenticated() && req.user.role === 'HR') {
            const { time } = req.params; 
            if (!time) {
                res.status(400).json({ message: 'Time parameter is required' });
                return;
            }

            const availableInterviewers = await pool.query(
                `SELECT * FROM users 
                 WHERE role = $1 
                 AND id NOT IN (
                     SELECT interviewer_id FROM interviews 
                     WHERE scheduled_at = $2::timestamp
                 )`,
                ['Interviewer', new Date(time)]
            );

            res.status(200).json({
                message: 'Available Interviewers Fetched Successfully',
                data: availableInterviewers.rows
            });
        } else {
            res.status(403).json({ message: 'You are not authorized to access this resource' });
        }
    } catch (error: any) {
        logger.error('Error fetching available interviewers:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};


export { addInterviewer, getAllInterviewers, getAvailableInterviewer };