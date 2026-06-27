import express from "express";

import upload from "../middleware/upload.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/*
==========================================
Upload Single File
POST /api/upload
==========================================
*/

router.post(

    "/",

    authenticateToken,

    upload.single("file"),

    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "No file uploaded."

                });

            }

            const fileUrl =
                "/uploads/" + req.file.filename;

            res.status(201).json({

                success: true,

                message: "File uploaded successfully.",

                file: {

                    originalName: req.file.originalname,

                    filename: req.file.filename,

                    mimetype: req.file.mimetype,

                    size: req.file.size,

                    url: fileUrl

                }

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message: "Upload failed."

            });

        }

    }

);

export default router;
