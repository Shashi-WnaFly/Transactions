import express from "express";
import { userRegisterController } from "../controllers/auth.controller.js";
const router = express.Router();

/**
 * path: /api/auth/register
 */
router.post("/register", userRegisterController);

export default router;
