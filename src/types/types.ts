import { Schema, HydratedDocument, Model } from "mongoose";

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
