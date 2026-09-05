import mongoose from "mongoose";
import TransactionModel from "../models/transaction.model.js";
import AccountModel from "../models/account.model.js";
import LedgerModel from "../models/ledger.model.js";
import {
  InsufficientFundsError,
  InvalidPayerError,
  InvalidRecipientError,
} from "../errors/transaction.error.js";
import { Response } from "express";

export async function createTransfer(input: {
  fromAccount: mongoose.Schema.Types.ObjectId;
  toAccount: mongoose.Schema.Types.ObjectId;
  amount: number;
  idempotencyKey: string;
  userId: mongoose.Schema.Types.ObjectId;
}) {
  const session = await mongoose.startSession();
  try {
    /**
     * session and transaction starting
     */
    return session.withTransaction(async () => {
      /**
       * Validate idempotency key
       */
      const existing = await TransactionModel.findOne({
        idempotencyKey: input.idempotencyKey,
      }).session(session);

      if (existing) {
        return { transaction: existing, duplicate: true };
      }

      const [transaction]: any = await TransactionModel.create(
        [
          {
            fromAccount: input.fromAccount,
            toAccount: input.toAccount,
            amount: input.amount,
            idempotencyKey: input.idempotencyKey,
            status: "PENDING",
          },
        ],
        { session: session },
      );

      /**
       * Validate account availabilty and status
       */

      const debitedAccount = await AccountModel.findOne({
        _id: input.fromAccount,
        user: input.userId,
        status: "ACTIVE",
      });

      if (!debitedAccount) {
        throw new InvalidPayerError();
      }

      /**
       * Derive Sender balance from ledger
       */

      const fromBalance = await debitedAccount.getBalance();

      if (fromBalance < input.amount) {
        throw new InsufficientFundsError();
      }

      const creditedAccount = await AccountModel.findOne({
        _id: input.toAccount,
        status: "ACTIVE",
      });

      if (!creditedAccount) {
        throw new InvalidRecipientError();
      }

      /**
       * Creating Ledger Entries
       */

      await LedgerModel.insertMany(
        [
          {
            account: input.fromAccount,
            transaction: transaction._id,
            amount: input.amount,
            type: "DEBIT",
          },
          {
            account: input.toAccount,
            transaction: transaction._id,
            amount: input.amount,
            type: "CREDIT",
          },
        ],
        { session: session },
      );

      transaction.status = "COMPLETED";
      await transaction.save({ session });

      return { transaction: transaction, duplicate: false };
    });
  } finally {
    /**
     * commiting
     */
    session.endSession();
  }
}

export function transactionExists(
  res: Response,
  status: string,
  transaction: object,
) {
  if (status === "COMPLETED") {
    return res.status(200).json({
      message: "Transaction is successfully completed",
      status: "success",
      transaction: transaction,
    });
  }
  if (status === "FAILED") {
    return res.status(500).json({
      message: "Transaction processing failed, please retry",
    });
  }
  if (status === "REVERSED") {
    return res.status(500).json({
      message: "Transaction was reversed, please retry",
    });
  }
  return res.status(200).json({
    message: "Transaction is still processing",
  });
}
