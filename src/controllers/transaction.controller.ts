import { Request, Response } from "express";
import TransactionModel from "../models/transaction.model.js";
import AccountModel from "../models/account.model.js";
import mongoose from "mongoose";
import LedgerModel from "../models/ledger.model.js";
import sendEmail from "../services/email.service.js";
import { transactionEmailHtml } from "../utils/constants.js";
import {
  createTransfer,
  transactionExists,
} from "../services/transaction.service.js";

/**
 * - Create a new transaction
 * The 10-step of transfer flow
 * 1. Validate Request
 * 2. Validate idempotency Key
 * 3. Check account availability and status
 * 4. Derive Sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 * @param req
 * @param res
 */
async function createTransactionController(req: Request, res: Response) {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    /**
     * Validate request
     */

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "Some fields are missing.",
        status: "failed",
      });
    }

    if (fromAccount.toString() !== toAccount.toString()) {
      return res.status(400).json({
        message: "Invalid transaction details.",
        status: "failed",
      });
    }

    const isIdempotencyKeyExists = await TransactionModel.findOne({
      idempotencyKey: idempotencyKey,
    });

    if (isIdempotencyKeyExists) {
      transactionExists(
        res,
        isIdempotencyKeyExists.status,
        isIdempotencyKeyExists,
      );
    }

    const transactionData = await createTransfer({
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      userId: req.user._id,
    });

    if (transactionData.duplicate) {
      return res.status(200).json({
        message: "Transaction already exists with the same idempotency key",
        transaction: transactionData.transaction,
        status: "success",
      });
    }
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: transactionData.transaction,
      status: "success",
    });

    /**
     * Send email notification
     */

    // const toBalance = await to.getBalance();

    // const toEmailDetails = {
    //   customerName: to?.user?.firstName!,
    //   amount: amount,
    //   transactionType: "CREDIT",
    //   transactionId: transaction._id.toString(),
    //   availableBalance: toBalance,
    //   date: transaction.createdAt,
    // };

    // const fromEmailDetails = {
    //   customerName: req?.user?.firstName!,
    //   amount: amount,
    //   transactionType: "DEBIT",
    //   transactionId: transaction._id.toString(),
    //   availableBalance: fromBalance - amount,
    //   date: transaction.createdAt,
    // };

    // await sendEmail(
    //   to.user.emailId,
    //   "Transaction Notification",
    //   transactionEmailHtml(toEmailDetails),
    // ).catch((error) => {
    //   console.error("Error sending welcome email:", error);
    // });
    // await sendEmail(
    //   req.user.emailId,
    //   "Transaction Notification",
    //   transactionEmailHtml(fromEmailDetails),
    // ).catch((error) => {
    //   console.error("Error sending welcome email:", error);
    // });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      message: "An error occurred while creating the transaction.",
      status: "failed",
    });
  }
}

async function createInitialFundsTransactionController(
  req: Request,
  res: Response,
) {
  let session = null;
  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(500).json({
        message: "toAccount, amount and idempotencyKey all are required",
      });
    }

    if (amount < 0) {
      return res.status(500).json({
        message: "Invalid request, Amount should be positive",
      });
    }

    const isIdempotencyKeyExists = await TransactionModel.findOne({
      idempotencyKey: idempotencyKey,
    });

    if (isIdempotencyKeyExists) {
      if (isIdempotencyKeyExists.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction is successfully completed",
          status: "success",
          transaction: isIdempotencyKeyExists,
        });
      }
      if (isIdempotencyKeyExists.status === "PENDING") {
        return res.status(200).json({
          message: "Transaction is still processing",
        });
      }
      if (isIdempotencyKeyExists.status === "FAILED") {
        return res.status(500).json({
          message: "Transaction processing failed, please retry",
          status: "failed",
        });
      }
      if (isIdempotencyKeyExists.status === "REVERSED") {
        return res.status(500).json({
          message: "Transaction was reversed, please retry",
        });
      }
    }

    const toAccountData = await AccountModel.findById(toAccount);

    if (!toAccountData || toAccountData.status !== "ACTIVE") {
      return res.status(500).json({
        message: "Invalid request, Account should be ACTIVE",
      });
    }

    const fromAccountData = await AccountModel.findOne({
      user: req.user._id,
    });

    if (!fromAccountData) {
      return res.status(400).json({
        message: "System user account not found",
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new TransactionModel({
      fromAccount: fromAccountData._id,
      toAccount,
      amount,
      idempotencyKey,
    });

    const debitLedgerEntry = new LedgerModel({
      account: fromAccountData._id,
      amount,
      type: "DEBIT",
      transaction: transaction._id,
    });

    const creditLedgerEntry = new LedgerModel({
      account: toAccount,
      amount,
      type: "CREDIT",
      transaction: transaction._id,
    });

    await transaction.save({ session });
    await debitLedgerEntry.save({ session });
    await creditLedgerEntry.save({ session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    await session.endSession();

    res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction,
      status: "success",
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }
    console.error("Error creating transaction:", error);
    res.status(500).json({
      message: "An error occurred while creating the transaction.",
      status: "failed",
    });
  }
}

export { createTransactionController, createInitialFundsTransactionController };
