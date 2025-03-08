import passport from "passport";
import { NextFunction, Request, Response } from "express";
import pool from "../config/db";
import { User } from "../@types/user";
import logger from "../utils/logger";
import { createCandidateSchema, signUpSchema } from '../validators/zod'
import crypto from 'crypto';
import sendMail from "../utils/mailer";
import { CredentialInfoTemplate } from "../utils/mail_template";

interface RequestWithFiles extends Request {
    files?: { [fieldname: string]: Express.Multer.File[] };
}

const signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        passport.authenticate('local', (err: any, user: User, info: any) => {
            if (err) {
                logger.error("Passport authentication error:", { error: err.message || err });
                res.status(500).json({ message: 'Internal Server Error', error: err.message || err });
                return;
            }

            if (!user) {
                logger.warn("Authentication failed:", { info });
                res.status(401).json({ message: 'Invalid username or password' });
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    logger.error("Login session error:", { error: err.message || err });
                    res.status(500).json({ message: 'Login failed', error: err.message || err });
                    return;
                }

                logger.info("Login successful", { userId: user.id, username: user.username });
                res.status(200).json({ message: 'Login successful', user });
            });
        })(req, res, next);
    } catch (error: any) {
        logger.error("Unexpected error:", { error: error.message || error });
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
};

const logout = async (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            logger.error("Logout error:", { error: err.message || err });
            res.status(500).json({ message: 'Logout failed', error: err.message || err });
            return;
        }

        req.session.destroy((err) => {
            res.clearCookie("connect.sid");
            if (err) {
                logger.error("Session destruction error:", { error: err.message || err });
                res.status(500).json({ message: 'Session destruction failed', error: err.message || err });
                return;
            }
            logger.info("Logout successful");
            res.status(200).json({ message: 'Logout successful' });
        });
    });
}

const getUserDetails = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }

    res.json({ user: req.user });
}

const createCandidate = async (req: Request, res: Response) => {
   if(req.isAuthenticated() && req.user.role === 'HR') {
       try {
            const Result = createCandidateSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).json({message: "Invalid input data"});
                return;
            }

           const { username, email, password, source } = Result.data;
           
           const userExists = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
           if (userExists.rows.length > 0) {
               res.status(400).json({ message: 'User already exists' });
               return;
           }
           
           const newUser = await pool.query(
               `INSERT INTO users (username, email, password, role, updated_at, status, source) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role, status`,
               [username, email, password, 'Candidate', new Date(), 'Active', source]
           );
           await sendMail(email, "MightyRecruit Access Credential", CredentialInfoTemplate(username, email, password));
           res.status(200).json({ 
               message: 'User created successfully', 
               user: newUser.rows[0]
           });

       } catch (error: any) {
           logger.error("Create user error:", { error: error.message || error });
           res.status(500).json({ message: 'Internal Server Error', error: error.message || error });
       }
   }
   else {
       res.status(403).json({ message: 'Unauthorized. Only HR can create new users.' });
   }
}

const signup = async (req: Request, res: Response) => {
    const Result = signUpSchema.safeParse(req.body);
    if (!Result.success) {
        res.status(400).json({ message: 'Invalid input data', errors: Result.error.errors });
        return;
    }

    const { username, email, password } = Result.data;

    try {
        const userExists = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const newUser = await pool.query(
            `INSERT INTO users (username, email, password, role, updated_at, status, source) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [username, email, password, "Candidate", new Date(), 'Active', 'Website']
        );

        res.status(200).json({ message: 'User signed up successfully', userId: newUser.rows[0].id });
    } catch (error: any) {
        logger.error("Signup error:", { error: error.message || error });
        res.status(500).json({ message: 'Internal Server Error', error: error.message || error });
    }
}

const forgetPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    const client = await pool.connect();
    try {
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newPassword = crypto.randomBytes(8).toString('hex');
        await client.query('BEGIN');
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newPassword, email]);
        const emailContent = `
            <html>
            <head>
                <style>
                    .container {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        background-color: #f9f9f9;
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .content {
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .footer {
                        text-align: center;
                        padding-top: 20px;
                        font-size: 12px;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Password Reset</h2>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>Your password has been reset. Your new password is:</p>
                        <p><strong>${newPassword}</strong></p>
                        <p>Please change your password after logging in.</p>
                    </div>
                    <div class="footer">
                        <p>If you did not request this change, please contact support immediately.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        sendMail(email, "Password Reset", emailContent);
        await client.query('COMMIT');
        res.status(200).json({ message: 'New password has been sent to your email' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("Forget password error:", { error: error.message || error });
        res.status(500).json({ message: 'Internal Server Error', error: error.message || error });
    } finally {
        client.release();
    }
}

const checkUsername = async (req: Request, res: Response) => {
    try {
        const username = req.query.username;
        // Validate input
        if (!username) {
            res.status(400).json({ error: 'Invalid username' });
            return;
        }

        const query = 'SELECT COUNT(*) FROM users WHERE username = $1';
        const { rows } = await pool.query(query, [username]);
        const count = parseInt(rows[0].count, 10);
        
        res.json({ exists: count > 0 });
    } catch (error: any) {
        logger.error("checkUsername error:", { error: error.message || error });
        res.status(500).json({ message: 'Internal Server Error', error: error.message || error });
    }
}

const changePassword = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return 
    }

    const { oldpassword, newpassword } = req.body;
    
    if (!oldpassword || !newpassword) {
        res.status(400).json({ message: "Old password and new password are required" });
        return 
    }

    const client = await pool.connect();
    try {
        // Verify old password
        const userResult = await client.query(
            'SELECT password FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return 
        }

        const storedPassword = userResult.rows[0].password;
        if (storedPassword !== oldpassword) {
            res.status(400).json({ message: "Incorrect old password" });
            return 
        }

        // Update to new password
        await client.query('BEGIN');
        await client.query(
            'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3',
            [newpassword, new Date(), req.user.id]
        );
        await client.query('COMMIT');

        logger.info("Password changed successfully", { userId: req.user.id });
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error("Change password error:", { error: error.message || error });
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    } finally {
        client.release();
    }
};

export { 
    signin, 
    logout, 
    getUserDetails,
    signup,
    forgetPassword,
    checkUsername,
    createCandidate,
    changePassword
};