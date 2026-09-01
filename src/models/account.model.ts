import mongoose, { Schema } from "mongoose";
import { IAccountModel, IAccount, IAccountMethods } from "../types/types.js";
import Ledger from "./ledger.model.js";

const accountSchema = new Schema<IAccount, IAccountModel, IAccountMethods>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account must be associated with user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FREEZE", "CLOSED"],
        message: "Status can be either ACTIVE, FREEZE or CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      default: "INR",
      required: [true, "Currecy is required for creating a account"],
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function (): Promise<number> {
  const balanceData = await Ledger.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [
              {
                eq: ["$type", "DEBIT"],
              },
              "amount",
              0,
            ],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [
              {
                $eq: ["$type", "CREDIT"],
              },
              "amount",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  return balanceData.length == 0 ? 0 : balanceData[0].balance;
};

const AccountModel = mongoose.model<IAccount, IAccountModel>(
  "account",
  accountSchema,
);
export default AccountModel;
