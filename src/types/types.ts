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
  user: IUser;
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
  _id: Schema.Types.ObjectId;
  fromAccount: Object;
  toAccount: Object;
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
  _id: Schema.Types.ObjectId;
  account: Schema.Types.ObjectId;
  amount: number;
  type: ledgerType;
  transaction: Schema.Types.ObjectId;
}

export type ledgerType = "CREDIT" | "DEBIT";
