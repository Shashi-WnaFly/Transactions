import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import TokenBlackModel from "../models/tokenBlacklist.model.js";

/**
 * verify the user using cookies and add it to request
 * @param req
 * @param res
 * @param next
 */

async function userAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, token is missing" });
    }

    const isTokenBlacklisted = await TokenBlackModel.findOne({
      token: token,
    });

    if (isTokenBlacklisted) {
      return res.status(403).json({ message: "Token is blacklisted" });
    }

    const isTokenValid = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    if (!isTokenValid) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, token is missing" });
    }

    const user = await UserModel.findById(isTokenValid.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, token is missing" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication failed" });
  }
}

export default userAuth;
