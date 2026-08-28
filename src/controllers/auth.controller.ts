import { Request, Response } from "express";
import { validateRegister } from "../utils/validation.js";
import User from "../models/user.model.js";
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

    const isUserExists = await User.findOne({ emailId: normalizedEmailId });

    if (isUserExists) {
      return res.status(400).json({
        message: "User already exists with this email.",
        status: "failed",
      });
    }

    const user = new User({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      middleName: normalizedMiddleName,
      mobileNo,
      emailId: normalizedEmailId,
      password,
    });

    const savedUser = await user.save();

    const token = savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    req.user = savedUser;

    res.status(201).json({
      message: "User registered successfully",
      data: savedUser,
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
    const user = await User.findOne({
      emailId: emailId.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failed",
        success: false,
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failed",
        success: false,
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
      success: true,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Error logging in user",
      status: "error",
      error: error.message,
      success: false,
    });
  }
}

export { userRegisterController, userLoginController };
