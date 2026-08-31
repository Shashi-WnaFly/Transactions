import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.js";

const authSystemUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized access, token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const systemUser = await User.findOne({
      _id: decoded.id,
      systemUser: true,
    });

    if (!systemUser) {
      return res.status(403).json({
        message: "Access forbidden, access denied",
      });
    }

    req.user = systemUser;

    next();
  } catch (error) {
    console.error("System user authentication error: ", error);
    return res.status(401).json({
      message: "Something went wrong, access denied",
    });
  }
};

export default authSystemUser;
