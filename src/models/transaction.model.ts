import mongoose from "mongoose";
import { ITransaction } from "../types/types.js";

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, ""],
      ref: "account",
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, ""],
      ref: "account",
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required for creating a transaction"],
      min: [0, "Transaction amount cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED",
      },
      default: "PENDING",
    },
    idempotencyKey: {
      type: String,
      unique: true,
      required: [true, "Idempotency key is required for create a transaction"],
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model<ITransaction>(
  "transaction",
  transactionSchema,
);

export default Transaction;
