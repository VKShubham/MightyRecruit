import { Request, Response } from "express";
import logger from "../utils/logger";
import { Candidate } from "../@types/candidate";
import pool from "../config/db";
import { RegisterFormSchema } from "../validators/zod";

export interface RequestWithFiles extends Request {
    files?: { [fieldname: string]: Express.Multer.File[] };
}

const getCandidateDetails = async (req: Request, res: Response) => {
    if(req.isAuthenticated() && (req.user.role === 'HR' || req.user.role === 'Interviewer')) {
        try {
            const { id } = req.params;
            if(!id) {
                res.status(400).send({message: "Invalid candidate id"})
                return;
            }

            const result = await pool.query(`
            SELECT c.*, u.email, u.status 
            FROM candidate c
            JOIN users u ON c.userid = u.id
            WHERE c.id = $1 
            `, [id]);

            if (result.rowCount === 0) {
                res.status(404).json({ message: "Candidate Not Found" });
                return;
            }

            const candidate = result.rows[0];

            res.status(200).json({
                message: "Candidate Detail Fetched",
                data: {
                    ...candidate,
                    resume_url: candidate.resume_url ? `http://localhost:3000/${candidate.resume_url}` : null,
                    profile_picture_url: candidate.profile_picture_url ? `http://localhost:3000/${candidate.profile_picture_url}` : null
                }
            });
           
        } catch (error: any) {
            logger.error("getCandidateDetails error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.warn(`Trying to get Candidate Detail by User :- ${req.user?.id}`)
        res.status(403).json({message: 'You are not Authorized to get Candidate detail'});
    }
}

const register = async (req: RequestWithFiles, res: Response) => {
    if (req.isAuthenticated() && req.user.role === "Candidate") {
        try {
            const formData = req.body;

            // Parse JSON fields
            ["address", "education", "work_experience", "skills"].forEach((key) => {
                if (formData[key]) {
                    try {
                        formData[key] = JSON.parse(formData[key]);
                    } catch (e) {
                        res.status(400).json({ message: `Invalid JSON format for ${key}` });
                        return 
                    }
                }
            });

            // Validate the data with Zod schema
            const result = RegisterFormSchema.safeParse(formData);
            if (!result.success) {
                res.status(400).json({ message: "Invalid input data", errors: result.error.errors });
                return 
            }

            const data = result.data;
            await pool.query("BEGIN");

            // Check if the candidate already exists
            const existingCandidate = await pool.query(
                `SELECT * FROM candidate WHERE userid = $1`,
                [req.user.id]
            );
            
            // Handle file uploads
            const resumeFile = req.files?.["resume_url"] ? req.files["resume_url"][0] : null;
            const profilePictureFile = req.files?.["profile_picture_url"] ? req.files["profile_picture_url"][0] : null;

            // Let we check if the field was changes or not (Dynamic Query Building)
            const currentData = existingCandidate.rows[0];
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            const FieldToCheck = [
                "firstname",
                "lastname",
                "phone",
                "date_of_birth",
                "address",
                "education",
                "skills",
                "work_experience",
                "linkedin_url",
                "github_url",
                "notes",
                "current_salary",
                "expected_salary",
            ]

            FieldToCheck.forEach((field) => {
                if(currentData[field] != data[field]) {
                    updates.push(`${field} = $${paramIndex}`);
                    values.push(typeof data[field] === "object" ? JSON.stringify(data[field]) : data[field]);
                    paramIndex++;
                }
                
            })

            if (resumeFile) {
              updates.push(`resume_url = $${paramIndex}`);
              values.push(`uploads/${req.user.email}/${resumeFile.filename}`);
              paramIndex++;
            }
            if (profilePictureFile) {
              updates.push(`profile_picture_url = $${paramIndex}`);
              values.push(`uploads/${req.user.email}/${profilePictureFile.filename}`);
              paramIndex++;
            }

            updates.push(`updated_at = $${paramIndex}`);
            values.push(new Date());
            paramIndex++;

            values.push(req.user.id);

            if (existingCandidate.rows.length > 0) {
                // Update candidate data
                await pool.query(
                    `UPDATE candidate SET
                    ${updates.join(", ")}
                    WHERE userid = $${paramIndex}`,
                    values
                );
                
                await pool.query("COMMIT");
                res.status(200).json({ message: "Candidate updated successfully" });
            } else {
                // Candidate does NOT exist → Insert new candidate
                    
                const resumePath = resumeFile ? `uploads/${req.user.email}/${resumeFile.filename}` : null;
                const profilePicturePath = profilePictureFile ? `uploads/${req.user.email}/${profilePictureFile.filename}` : null;
                    
                // Insert into candidate
                await pool.query(`
                    INSERT INTO candidate (
                    userid, firstname, lastname, phone, date_of_birth, address, 
                    education, skills, work_experience, resume_url, linkedin_url, 
                    github_url, notes, profile_picture_url, current_salary, expected_salary, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, 
                        $10, $11, $12, $13, $14, $15, $16, $17
                    )`,
                    [
                        req.user.id,
                        data?.firstname,
                        data?.lastname,
                        data?.phone,
                        data?.date_of_birth,
                        JSON.stringify(data?.address),  
                        JSON.stringify(data?.education),  
                        JSON.stringify(data?.skills),
                        JSON.stringify(data?.work_experience), 
                        resumePath,
                        data?.linkedin_url || null,
                        data?.github_url || null,
                        data?.notes || null,
                        profilePicturePath,
                        data?.current_salary,
                        data?.expected_salary,
                        new Date()
                    ]
                );
            
                await pool.query('COMMIT');
                res.status(200).json({ message: "Candidate registered successfully" });
            }

        } catch (error: any) {
            await pool.query("ROLLBACK");
            console.error("Error processing candidate:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    } else {
        logger.warn(`Unauthorized access attempt by User :- ${req.user?.id}`);
        res.status(403).json({ message: "You are not authorized to register as a candidate" });
        return;
    }
};

const getProfileDetails = async (req: Request, res: Response) => {
    if(req.isAuthenticated()) {
        try {
            const CandidateResult = await pool.query(`SELECT id FROM candidate WHERE userid = $1`, [req.user.id]);
            if(CandidateResult.rowCount === 0) {
                const UserResult = await pool.query(`SELECT email, username FROM users WHERE id = $1`, [req.user.id])
                res.status(202).json({
                    message: 'New Candidate',
                    data: UserResult.rows[0]
                })
            }
            else {
                const { id } = CandidateResult.rows[0];
                const candidateDetails = await pool.query(`SELECT c.*, u.email, u.username FROM candidate c 
                    JOIN users u ON u.id  = c.userid
                    WHERE c.id = $1`, [id]);
                    const candidate: Candidate = candidateDetails.rows[0];
                    res.status(200).json({
                        message: 'Profile Details Fetched',
                        data: {
                            ...candidate,
                            resume_url: candidate.resume_url ? `http://localhost:3000/${candidate.resume_url}` : null,
                            profile_picture_url: candidate.profile_picture_url ? `http://localhost:3000/${candidate.profile_picture_url}` : null
                        }
                    });
            }
        } catch (error: any) {
            logger.error("getProfileDetails error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.warn(`Trying to get Profile Detail by User :- ${req.user?.id}`)
        res.status(403).json({message: 'You are not Authorized to get Profile detail'});
    }
}

const isCandidate = async (req: Request, res: Response) => {
    if(req.isAuthenticated()) {
        try {
            const CandidateResult = await pool.query(`SELECT id FROM candidate WHERE userid = $1`, [req.user.id]);
            if (CandidateResult.rowCount > 0) {
                res.status(200).json({ message: "User is a candidate", isCandidate: true });
            } else {
                res.status(200).json({ message: "User is not a candidate", isCandidate: false });
            }
        } catch (error: any) {
            logger.error("isCandidate error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.warn(`Unauthorized access attempt by User :- ${req.user?.id}`);
        res.status(203).json({ message: "You are not authorized" });
        return;
    }
}

export {
    register,
    getCandidateDetails,
    getProfileDetails,
    isCandidate
}