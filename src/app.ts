import express from "express";

const app = express();

app.use(express.json());

import authRouter from "./routes/auth.routes.js"
import accountRouter from "./routes/account.routes.js"

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);

export default app;
