import express from "express";
const router = express.Router();
import userAuthMiddleware from "../middleware/auth.middleware.js";
import {
  createTransactionController,
  createInitialFundsTransactionController,
} from "../controllers/transaction.controller.js";
import authSystemUserMiddleware from "../middleware/authSystemUser.middleware.js";

/**
 * - POST /api/transactions/
 */

router.post("/", userAuthMiddleware, createTransactionController);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */

router.post(
  "/system/initial-funds",
  authSystemUserMiddleware,
  createInitialFundsTransactionController,
);

export default router;
