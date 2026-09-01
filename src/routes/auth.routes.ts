import express from "express";
import {
  userLoginController,
  userRegisterController,
  userLogoutController,
} from "../controllers/auth.controller.js";
const authRouter = express.Router();

/**
 * path: /api/auth/register
 */
authRouter.post("/register", userRegisterController);

/**
 * path: /api/auth/login
 */

authRouter.post("/login", userLoginController);

/**
 * path: /api/auth/logout
 */

authRouter.post("/logout", userLogoutController);

export default authRouter;
