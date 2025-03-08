import { Request, Response } from "express"
import logger from "../utils/logger";
import { CreateBageSchema, UpdateBageSchema } from "../validators/zod";
import pool from "../config/db";

export const CreateBadge = async (req: Request, res: Response) => {
    if(req.isAuthenticated() && req.user.role === 'HR') {
        try {
            const Result = CreateBageSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send({message: "Inavlid input data"})
                return;
            }

            const data = Result.data

            const existingBadge = await pool.query('SELECT * FROM badges WHERE name = $1', [data.name]);
            if (existingBadge.rowCount > 0) {
                res.status(409).send({ message: "Badge with this title already exists" });
                return;
            }

            await pool.query(`
                INSERT INTO badges (name, color, updated_at, created_by, updated_by)
                VALUES ($1, $2, $3, $4, $5)
            `, [data.name, data.color, new Date(), req.user.id, req.user.id]);
            res.status(200).send({ message: "Badge created successfully" });
        } catch (error: any) {
            logger.error("CreateBadge error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.error(`Trying to create badge: ${req.user?.id}`);
        res.status(403).send('Unauthorized to create badge');
    }
}

export const UpdateBadge = async (req: Request, res: Response) => {
    if(req.isAuthenticated() && req.user.role === 'HR') {
        try {
            const Result = UpdateBageSchema.safeParse(req.body);
            if(!Result.success) {
                res.status(400).send({message: "Inavlid input data"})
                return;
            }

            const data = Result.data

            const existingBadge = await pool.query('SELECT * FROM badges WHERE name = $1', [data.name]);
            const CurrentBadge = await pool.query(`SELECT name FROM badges WHERE id = $1`, [data.id]);
            if (existingBadge.rowCount > 0 && CurrentBadge.rows[0].name !== data.name) {
                res.status(409).send({ message: "Badge with this title already exists" });
                return;
            }

            await pool.query(`
                UPDATE badges 
                SET name = $1, color = $2, updated_at = $3, updated_by = $4
                WHERE id = $5
            `, [data.name, data.color, new Date(), req.user.id, data.id]);
            res.status(200).send({ message: "Badge Updated successfully" });
        } catch (error: any) {
            logger.error("UpdateBadge error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.error(`Trying to UpdateBadge: ${req.user?.id}`);
        res.status(403).send('Unauthorized to UpdateBadge');
    }
}

export const getAllBadges = async (req: Request, res: Response) => {
    if(req.isAuthenticated() && req.user.role === 'HR') {
        try {
            const BadgeResult = await pool.query(`
                    SELECT b.name, 
                    b.id,
                    b.color, 
                    b.created_at, 
                    b.updated_at,
                    u.username AS created_by
                    FROM badges b JOIN users u
                    ON u.id = b.created_by
                `);
            if (BadgeResult.rowCount > 0) {
                res.status(200).send({ message: "Badges succesfully fetched", data: BadgeResult.rows });
            }
            else {
                res.status(204).send({ message: "No badges found" });
            }
        } catch (error: any) {
            logger.error("get badges error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.error(`Trying to get badges: ${req.user?.id}`);
        res.status(403).send('Unauthorized to get badges');
    }
}

export const AttachBadge = async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== 'HR') {
        logger.error(`AttachBadge: Unauthorized access by user ${req.user?.id}`);
        res.status(403).send('Unauthorized to attach badges');
        return;
    }

    try {
        const { application_id, badge_ids } = req.body;

        // Validate input: badge_ids should be an array (it may be empty if all badges were unchecked)
        if (!application_id || !Array.isArray(badge_ids)) {
            res.status(400).json({ message: "Application ID and badge IDs array are required" });
            return; 
        }

        // Check if the application exists
        const applicationResult = await pool.query(
            'SELECT id FROM applications WHERE id = $1',
            [application_id]
        );
        if (applicationResult.rowCount === 0) {
            res.status(404).json({ message: "Application not found" });
            return; 
        }

        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Remove all existing badge attachments for the application
            await client.query(
                'DELETE FROM application_badges WHERE application_id = $1',
                [application_id]
            );

            // Bulk insert new badge attachments if any are provided
            if (badge_ids.length > 0) {
                const insertValues = badge_ids
                    .map((_, index) => `($1, $${index + 2})`)
                    .join(", ");
                const queryParams = [application_id, ...badge_ids];
                await client.query(
                    `INSERT INTO application_badges (application_id, badge_id) VALUES ${insertValues}`,
                    queryParams
                );
            }

            await client.query('COMMIT');

            res.status(200).json({
                message: "Badges updated successfully",
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error: any) {
        logger.error("AttachBadge error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const GetApplicationBadges = async (req: Request, res: Response) => {
    if(req.isAuthenticated() && req.user.role === 'HR') {
        try {
           const { application_id } = req.params;
        // Validate application_id  is provided
        if (!application_id ) {
            res.status(400).json({ message: "Application ID is required" });
            return;
        }

        // Check if application exists
        const applicationResult = await pool.query('SELECT * FROM applications WHERE id = $1', [application_id]);
        if (applicationResult.rowCount === 0) {
            res.status(404).json({ message: "Application not found" });
            return;
        }

        const BadgeResult = await pool.query(`SELECT badge_id FROM application_badges WHERE application_id = $1`, [application_id]);
        
        res.status(200).json({message: "ApplicationBadges Fetched Successdully", data: BadgeResult.rows});
        } catch (error: any) {
            logger.error("getApplication badges error:", error);
            res.status(500).json({ message: error.message || "Internal Server Error" });
        }
    }
    else {
        logger.error(`Trying to get getApplicationBadges: ${req.user?.id}`);
        res.status(403).send('Unauthorized to get badges');
    }
}