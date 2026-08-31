import { Request, Response } from "express";
import Transaction from "../models/transaction.model.js";
import Account from "../models/account.model.js";
import mongoose from "mongoose";
import Ledger from "../models/ledger.model.js";
import sendEmail from "../services/email.service.js";
import { transactionEmailHtml } from "../utils/constants.js";

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
async function createTransaction(req: Request, res: Response) {
  let session: mongoose.ClientSession | null = null;
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

    /**
     * Validate idempotency key
     */

    const isIdempotencyKeyExists = await Transaction.findOne({
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
        });
      }
      if (isIdempotencyKeyExists.status === "REVERSED") {
        return res.status(500).json({
          message: "Transaction was reversed, please retry",
        });
      }
    }

    /**
     * Validate account availabilty and status
     */

    const from = await Account.findById(fromAccount).populate("user", [
      "firstName",
      "emailId",
    ]);
    const to = await Account.findById(toAccount).populate("user", [
      "firstName",
      "emailId",
    ]);

    if (!from || !to) {
      return res.status(400).json({
        message: "Accounts are invalid!!",
        status: "failed",
      });
    }

    if (from.status !== "ACTIVE" || to.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Both accounts should be ACTIVE ",
        status: "failed",
      });
    }

    /**
     * Derive Sender balance from ledger
     */

    const fromBalance = await from.getBalance();

    if (fromBalance < amount) {
      return res.status(400).json({
        message: `Insufficient balance, Current balance is ${fromBalance}. Requested amount is ${amount}`,
      });
    }

    /**
     * session and transaction starting
     *
     */

    session = await mongoose.startSession();
    session.startTransaction();

    /**
     * creating transaction entry default status(PENDING), debit and credit entry
     */

    const transaction = new Transaction(
      [
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
        },
      ],
      { session },
    );

    const debitAccountLedgerEntry = new Ledger(
      [
        {
          account: fromAccount,
          amount,
          type: "DEBIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );

    const creditAccountLedgerEntry = new Ledger(
      [
        {
          account: toAccount,
          amount,
          type: "CREDIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );

    transaction.status = "COMPLETED";

    await transaction.save({ session });

    /**
     * Mark transaction COMPLETED
     * Commit MongoDB session
     */

    await session.commitTransaction();
    await session.endSession();

    res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction,
      status: "success",
    });

    /**
     * Send email notification
     */

    const toBalance = await to.getBalance();

    const toEmailDetails = {
      customerName: to?.user?.firstName!,
      amount: amount,
      transactionType: "CREDIT",
      transactionId: transaction._id.toString(),
      availableBalance: toBalance,
      date: transaction.createdAt,
    };

    const fromEmailDetails = {
      customerName: req?.user?.firstName!,
      amount: amount,
      transactionType: "DEBIT",
      transactionId: transaction._id.toString(),
      availableBalance: fromBalance - amount,
      date: transaction.createdAt,
    };

    await sendEmail(
      to.user.emailId,
      "Transaction Notification",
      transactionEmailHtml(toEmailDetails),
    ).catch((error) => {
      console.error("Error sending welcome email:", error);
    });
    await sendEmail(
      req.user.emailId,
      "Transaction Notification",
      transactionEmailHtml(fromEmailDetails),
    ).catch((error) => {
      console.error("Error sending welcome email:", error);
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

async function createInitialFundsTransaction(req: Request, res: Response) {
  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || idempotencyKey) {
      return res.status(500).json({
        message: "toAccount, amount and idempotencyKey all are required",
      });
    }

    if (amount < 0) {
      return res.status(500).json({
        message: "Invalid request, Amount should be positive",
      });
    }

    const isIdempotencyKeyExists = await Transaction.findOne({
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

    const toAccountData = await Account.findById(toAccount);

    if (!toAccountData || toAccountData.status !== "ACTIVE") {
      return res.status(500).json({
        message: "Invalid request, Account should be ACTIVE",
      });
    }

    const fromAccountData = await Account.findOne({
      user: req.user._id,
    });

    if (!fromAccountData) {
      return res.status(400).json({
        message: "System user account not found",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await Transaction.create(
      [
        {
          fromAccount: fromAccountData._id,
          toAccount,
          amount,
          idempotencyKey,
        },
      ],
      { session },
    );

    const debitLedgerEntry = await Ledger.create(
      [
        {
          account: fromAccountData._id,
          amount,
          type: "DEBIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );
    const creditLedgerEntry = await Ledger.create(
      [
        {
          account: toAccount,
          amount,
          type: "CREDIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );
  } catch (error) {}
}

export { createTransaction, createInitialFundsTransaction };
