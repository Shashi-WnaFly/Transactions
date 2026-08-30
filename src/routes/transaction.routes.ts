import express from "express";
const router = express.Router();
import userAuth from "../middleware/auth.middleware.js";
import { createTransaction } from "../controllers/transaction.controller.js";

/**
 * - POST /api/transactions
 */

router.post("/", userAuth, createTransaction);

export default router;
