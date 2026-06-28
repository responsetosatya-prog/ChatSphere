// backend/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

/*
==========================================
Create Upload Folders
==========================================
*/

const uploadFolders = ['uploads', 'uploads/profiles', 'uploads/images', 'uploads/files'];

uploadFolders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

/*
==========================================
Storage Configuration
==========================================
*/

const storage = multer.diskStorage({
    destination(req, file, cb) {
        let folder = 'uploads/files';
        
        // Determine folder based on file type
        if (file.mimetype.startsWith('image/')) {
            folder = 'uploads/profiles';
        } else if (file.mimetype.startsWith('video/')) {
            folder = 'uploads/images';
        }
        
        cb(null, folder);
    },
    filename(req, file, cb) {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

/*
==========================================
Allowed File Types
==========================================
*/

const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/webm',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];

function fileFilter(req, file, cb) {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not supported.`), false);
    }
}

/*
==========================================
Upload Middleware
==========================================
*/

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

/*
==========================================
Upload File Handler
==========================================
*/

export const uploadFile = upload.single('file');

export const uploadMultiple = upload.array('files', 5);

export default upload;
