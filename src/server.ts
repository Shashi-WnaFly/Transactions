import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/", (req: Request, res: Response) => {
  res.json({ message: "welcome to the transactions project." });
});

app.listen(3000, () => {
    console.log("API listening on port : http://localhost:3000");
})
