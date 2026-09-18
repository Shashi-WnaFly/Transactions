import mongoose, {type Types} from "mongoose";
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
  fromAccount: Types.ObjectId;
  toAccount: Types.ObjectId;
  amount: number;
  idempotencyKey: string;
  userId: Types.ObjectId;
  deposit: boolean;
}) {
  const session = await mongoose.startSession();
  try {
    /**
     * session and transaction starting
     */
    return await session.withTransaction(async () => {
      /**
       * Validate idempotency key
       */
      const existing = await TransactionModel.findOne({
        idempotencyKey: input.idempotencyKey,
      }).session(session);

      if (existing) {
        return { transaction: existing, duplicate: true };
      }

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

      if (!input.deposit && fromBalance < input.amount) {
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
       * creating transaction
       */

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
       * Creating Ledger Entries
       */

      await (() => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * 15));
      })();

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
    return res.status(400).json({
      message: "Transaction processing failed, please retry",
    });
  }
  if (status === "REVERSED") {
    return res.status(400).json({
      message: "Transaction was reversed, please retry",
    });
  }
  return res.status(200).json({
    message: "Transaction is still processing",
  });
}
