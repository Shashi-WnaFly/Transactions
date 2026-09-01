import { Request, Response } from "express";
import { validateRegister } from "../utils/validation.js";
import UserModel from "../models/user.model.js";
import { welcomeEmailTemplate } from "../utils/constants.js";
import sendEmail from "../services/email.service.js";
/**
 * - user register controller
 * - POST /api/auth/register
 */

async function userRegisterController(req: Request, res: Response) {
  try {
    const { firstName, lastName, middleName, mobileNo, emailId, password } =
      req.body;
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedMiddleName = middleName?.trim();
    const normalizedEmailId = emailId.trim().toLowerCase();

    validateRegister({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      middleName: normalizedMiddleName,
      mobileNo,
      emailId: normalizedEmailId,
      password,
    });

    const isUserExists = await UserModel.findOne({
      emailId: normalizedEmailId,
    });

    if (isUserExists) {
      return res.status(400).json({
        message: "User already exists with this email.",
        status: "failed",
      });
    }

    const user = await UserModel.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      middleName: normalizedMiddleName,
      mobileNo,
      emailId: normalizedEmailId,
      password,
    });

    const token = user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    req.user = user;

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: user,
    });

    // Send welcome email

    const htmlContent = welcomeEmailTemplate.replace(
      "{{firstName}}",
      normalizedFirstName,
    );
    await sendEmail(
      normalizedEmailId,
      "Welcome to Acme Bank",
      htmlContent,
    ).catch((error) => {
      console.error("Error sending welcome email:", error);
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Error registering user",
      error: error.message,
    });
  }
}

/**
 * - user login controller
 * - POST /api/auth/login
 */

async function userLoginController(req: Request, res: Response) {
  try {
    const { emailId, password } = req.body;
    const user = await UserModel.findOne({
      emailId: emailId.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failed",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failed",
      });
    }

    const token = user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    req.user = user;

    res.status(200).json({
      message: "User logged in successfully",
      data: user,
      status: "success",
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Error logging in user",
      status: "error",
      error: error.message,
    });
  }
}

export { userRegisterController, userLoginController };
