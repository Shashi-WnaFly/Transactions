import express from "express";
import userAuthMiddleware from "../middleware/auth.middleware.js";
import { createAccountController } from "../controllers/account.controller.js";

const router = express.Router();
/**
 * POST /api/accounts/
 */
router.post("/", userAuthMiddleware, createAccountController);

export default router;
