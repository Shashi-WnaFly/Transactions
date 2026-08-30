import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

import authRouter from "./routes/auth.routes.js";
import accountRouter from "./routes/account.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

export default app;
