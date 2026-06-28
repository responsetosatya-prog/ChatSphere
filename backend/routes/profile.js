import express from "express";
import {
    getMyProfile,
    updateProfile,
    updateProfilePicture,
    changePassword,
} from "../controllers/profileController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authenticateToken, getMyProfile);
router.put("/update", authenticateToken, updateProfile);
router.put("/picture", authenticateToken, updateProfilePicture);
router.put("/password", authenticateToken, changePassword);

export default router;
