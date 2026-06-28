// backend/routes/upload.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/audio', 'uploads/documents'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads';
        if (file.mimetype.startsWith('image/')) dir = 'uploads/images';
        else if (file.mimetype.startsWith('video/')) dir = 'uploads/videos';
        else if (file.mimetype.startsWith('audio/')) dir = 'uploads/audio';
        else dir = 'uploads/documents';
        
        cb(null, path.join(__dirname, '..', dir));
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not supported`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB max
    }
});

// Upload single file
router.post('/file', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileUrl = `/uploads/${req.file.path.split('uploads/')[1]}`;
        
        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                url: fileUrl,
                filename: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype,
                name: req.file.filename
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'File upload failed'
        });
    }
});

// Upload multiple files
router.post('/files', authenticateToken, upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const files = req.files.map(file => ({
            url: `/uploads/${file.path.split('uploads/')[1]}`,
            filename: file.originalname,
            size: file.size,
            type: file.mimetype,
            name: file.filename
        }));
        
        res.json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            files: files
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'File upload failed'
        });
    }
});

export default router;
