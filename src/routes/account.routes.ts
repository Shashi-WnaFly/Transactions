import express from "express";
import userAuthMiddleware from "../middleware/auth.middleware.js";
import { createAccountController, getAllAccountsController } from "../controllers/account.controller.js";

const accountRouter = express.Router();

/**
 * POST /api/accounts/
 */

accountRouter.post("/", userAuthMiddleware, createAccountController);

/**
 * GET /api/accounts
 */

accountRouter.get("/", userAuthMiddleware, getAllAccountsController);

export default accountRouter;
