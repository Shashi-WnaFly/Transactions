import { Request, Response } from "express";
import AccountModel from "../models/account.model.js";

/**
 * - creating an account controller
 * - POST /api/accounts/
 * @param req
 * @param res
 */

async function createAccountController(req: Request, res: Response) {
  try {
    const user = req.user;

    const newAccount = await AccountModel.create({
      user: user._id,
    });

    res.status(201).json({
      status: "success",
      data: newAccount,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Failed to create account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * - get all accounts of logged in user
 * - GET /api/accounts/
 * @param req
 * @param res
 */

async function getAllAccountsController(req: Request, res: Response) {
  try {
    const accountsDetails = await AccountModel.find({ user: req.user._id });

    if (accountsDetails.length === 0) {
      return res.status(500).json({
        message: "You haven't create any account yet",
      });
    }

    res.status(200).json({
      status: "success",
      accounts: accountsDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(501).json({
      message: "Something went wrong",
      status: "failed",
      error: error,
    });
  }
}

/**
 * get available balance of an account
 * GET /api/accounts/balance/:accountId
 * @param req
 * @param res
 */

async function getAccountBalanceController(req: Request, res: Response) {
  try {
    const { accountId } = req.params;
    const account = await AccountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(500).json({
        message: "No account found",
        success: "failed",
      });
    }

    const balance = await account.getBalance();

    res.status(200).json({
      status: "success",
      available_balance: balance,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error message: ${error}`,
    });
  }
}

export { createAccountController, getAllAccountsController, getAccountBalanceController };
