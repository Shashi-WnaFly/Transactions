import { type HydratedDocument, type Model, type Types } from "mongoose";

/**
 * user interface and methods
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailId: string;
  mobileNo?: string;
  password: string;
  age?: number;
  gender?: "male" | "female" | "other";
  systemUser: boolean;
  otp?: string;
  otpExpireAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpireAt?: Date;
}

export interface IUserMethods {
  getJWT(): string;
  comparePassword(password: string): Promise<boolean>;
}

export type IUserModel = Model<IUser, {}, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

/**
 * account interface
 */

export interface IAccount extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  status: accountType;
  currency: string;
}

export interface IAccountMethods {
  getBalance: () => Promise<number>;
}
export type IAccountModel = Model<IAccount, {}, IAccountMethods>;
export type AccountDocument = HydratedDocument<IAccount, IAccountMethods>;
export type accountType = "ACTIVE" | "FREEZE" | "CLOSED";

/**
 * transaction interface
 */

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  fromAccount: Types.ObjectId;
  toAccount: Types.ObjectId;
  status: transactionStatusType;
  amount: number;
  idempotencyKey: string;
  createdAt: Date;
}

export type transactionStatusType =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

/**
 * ledger interface
 */

export interface ILedger extends Document {
  _id: Types.ObjectId;
  account: Types.ObjectId;
  amount: number;
  type: ledgerType;
  transaction: Types.ObjectId;
}

export type ledgerType = "CREDIT" | "DEBIT";
