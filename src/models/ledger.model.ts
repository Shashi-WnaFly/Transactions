import mongoose from "mongoose";
import { ILedger } from "../types/types.js";

const ledgerSchema = new mongoose.Schema<ILedger>(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      required: [
        true,
        "Account reference is required for creating a ledger entry",
      ],
      index: true,
      immutable: true,
      ref: "account",
    },
    amount: {
      type: Number,
      min: [0.01, "Amount must be a positive number"],
      required: [true, "Amount is required for creating a ledger entry"],
      immutable: true,
    },
    type: {
      type: String,
      required: [true, "Ledger type is required for creating a ledger entry"],
      enum: {
        values: ["CREDIT", "DEBIT"],
        message: "Invalid ledger type. It can only be either CREDIT or DEBIT",
      },
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      required: [
        true,
        "Transaction reference is required for creating a ledger entry",
      ],
      immutable: true,
      index: true,
    },
  },
  { timestamps: true },
);

const preventModification = () => {
  throw new Error("Ledger entry cannot be modified after creation");
};

ledgerSchema.pre("save", function () {
  if (!this.isNew) preventModification();
});

ledgerSchema.pre("updateOne", preventModification);
ledgerSchema.pre("findOneAndUpdate", preventModification);
ledgerSchema.pre("updateMany", preventModification);
ledgerSchema.pre("findOneAndDelete", preventModification);
ledgerSchema.pre("deleteOne", preventModification);
ledgerSchema.pre("deleteMany", preventModification);
ledgerSchema.pre("replaceOne", preventModification);
ledgerSchema.pre("findOneAndReplace", preventModification);

const LedgerModel = mongoose.model<ILedger>("ledger", ledgerSchema);

export default LedgerModel;
