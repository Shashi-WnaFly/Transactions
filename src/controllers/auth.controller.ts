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

export { userRegisterController };
