import express from "express";
const router = express.Router();
import userAuthMiddleware from "../middleware/auth.middleware.js";
import { createTransaction, createInitialFundsTransaction } from "../controllers/transaction.controller.js";
import authSystemUserMiddleware from "../middleware/authSystemUser.middleware.js";

/**
 * - POST /api/transactions/
 */

router.post("/", userAuthMiddleware, createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */

router.post("/system/initial-funds", authSystemUserMiddleware, createInitialFundsTransaction)

export default router;
