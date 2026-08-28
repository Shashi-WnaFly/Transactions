import express from "express";
import { userLoginController, userRegisterController } from "../controllers/auth.controller.js";
const router = express.Router();

/**
 * path: /api/auth/register
 */
router.post("/register", userRegisterController);

/**
 * path: /api/auth/login
 */
router.post("/login", userLoginController);

export default router;
