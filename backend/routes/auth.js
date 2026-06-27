import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

/*
====================================
Authentication Routes
====================================
*/

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post("/register", register);

/**
 * Login
 * POST /api/auth/login
 */
router.post("/login", login);

export default router;
