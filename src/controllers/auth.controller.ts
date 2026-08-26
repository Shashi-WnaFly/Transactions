import { Request, Response } from "express";
import { validateRegister } from "../utils/validation.js";
import User from "../models/user.js";
/**
 * - user register controller
 * - POST /api/auth/register
 */

async function userRegisterController(req: Request, res: Response) {
  try {
    const { firstName, lastName, middleName, mobileNo, emailId, password } =
      req.body;
    const normalizedFirstName = firstName.trim().toPascalCase();
    const normalizedLastName = lastName.trim().toPascalCase();
    const normalizedMiddleName = middleName.trim().toPascalCase();
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

    const token = user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
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
