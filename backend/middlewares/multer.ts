import { Request } from "express";
import { StorageEngine } from "multer";
import { File } from "node:buffer";

const multer = require('multer');
const fs = require('fs');
const path = require('path');

type MutationCallback = (error: any, destination?: string | null) => void;

const storage: StorageEngine = multer.diskStorage({
    destination: function (req: Request, file: File, cb: MutationCallback) {
        const email = req.user?.email as string;
        if(!email) {
            return cb(new Error("Email is required in the request body"), null);
        }

        const dir = path.join(__dirname, 'storage', email);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);  
    },
    filename: function (req: Request, file: Express.Multer.File, cb: MutationCallback) {
        const ext = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${Date.now()}${ext}`
        cb(null, fileName);
    }
});

const upload = multer({ storage });

module.exports = upload;
