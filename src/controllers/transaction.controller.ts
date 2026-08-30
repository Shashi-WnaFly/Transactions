import { Request, Response } from "express";
import Transaction from "../models/transaction.model.js";
import Account from "../models/account.model.js";
import mongoose from "mongoose";

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

    const from = await Account.findById(fromAccount);
    const to = await Account.findById(toAccount);

    if (!from || !to) {
      return res.status(400).json({
        message: "Accounts are invalid!!",
        status: "failed",
      });
    }

    if (from.status !== "ACTIVE" || to.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Both should be ACTIVE ",
        status: "failed",
      });
    }

    /**
     * Derive Sender balance from ledger
     */

    const balance = await fromAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance, Current balance is ${balance}. Requested amount is ${amount}`,
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction()

    const transaction = await Transaction.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey
    }{session});



  } catch (error) {}
}

export { createTransaction };
