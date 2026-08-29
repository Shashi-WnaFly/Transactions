import mongoose, { Schema } from "mongoose";
import { IAccount } from "../types/types.js";

const accountSchema = new Schema<IAccount>(
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

const Account = mongoose.model<IAccount>("account", accountSchema);
export default Account;
