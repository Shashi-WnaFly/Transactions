import express from "express";
import userAuth from "../middleware/auth.middleware.js";
import { createAccountController } from "../controllers/account.controller.js";

const router = express.Router();
/**
 * POST /api/accounts/
 */
router.post("/", userAuth, createAccountController);

export default router;
