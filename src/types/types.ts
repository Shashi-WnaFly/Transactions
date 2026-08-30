import { Schema, HydratedDocument, Model } from "mongoose";

/**
 * user interface and methods
 */
export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailId: string;
  mobileNo: string;
  password: string;
  age?: number;
  gender?: "male" | "female" | "other";
  otp?: string;
  otpExpireAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpireAt?: Date;
}

export interface IUserMethods {
  getJWT(): string;
  comparePassword(password: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

/**
 * account interface
 */

export interface IAccount extends Document {
  user: Schema.Types.ObjectId;
  status: accountType;
  currency: string;
}

export type accountType = "ACTIVE" | "FREEZE" | "CLOSED";

/**
 * transaction interface
 */

export interface ITransaction extends Document{
  fromAccount: Schema.Types.ObjectId,
  toAccount: Schema.Types.ObjectId,
  status: transactionStatusType,
  amount: number,
  idempotencyKey: string
}

export type transactionStatusType = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED"
