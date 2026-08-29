import { Request, Response } from "express";
import accountModel from "../models/account.model.js";

/**
 * - creating an account controller
 * - POST /api/accounts
 * @param req
 * @param res
 */

async function createAccountController (req: Request, res: Response) {
  try {
    const user = req.user;

    const newAccount = await accountModel.create({
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
};

export { createAccountController };
