import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(cookieParser());

import authRouter from "./routes/auth.routes.js";
import accountRouter from "./routes/account.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

app.get("/ping", (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Pong!" });
});

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

export default app;
