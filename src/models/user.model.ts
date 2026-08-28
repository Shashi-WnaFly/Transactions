import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, IUserMethods, UserModel } from "../types/types.js";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: {
      type: String,
      required: [true, "User first name required!"],
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    middleName: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: [true, "User last name required!"],
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    emailId: {
      type: String,
      required: [true, "User email Id required!"],
      trim: true,
      unique: [true, "Email Id already exists!"],
      maxLength: 100,
      lowercase: true,
      validate: (value: string) => {
        if (!validator.isEmail(value)) throw new Error("Email Id is Invalid!!");
      },
    },
    mobileNo: {
      type: String,
      unique: [true, "Mobile no. already exists!"],
      minLength: 10,
      maxLength: 10,
      required: [true, "User phone number required!"],
      select: false,
    },
    password: {
      type: String,
      required: [true, "User password required!"],
      minLength: 8,
      validate: (value: string) => {
        if (
          !validator.isStrongPassword(value, {
            minUppercase: 1,
            minLowercase: 1,
            minLength: 8,
            minNumbers: 1,
            minSymbols: 1,
          })
        )
          throw new Error("Password is Invalid!!");
      },
      select: false,
    },
    age: {
      type: Number,
      max: 125,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not supported",
      },
    },
    otp: {
      type: String,
      minLength: 6,
      maxLength: 6,
      default: null,
      trim: true,
      select: false,
    },
    otpExpireAt: {
      type: Date,
      default: null,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      trim: true,
      select: false,
    },
    resetPasswordTokenExpireAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getJWT = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: 24 * 60 * 60 * 1000,
  }); // 24 hours
  return token;
};

const User = mongoose.model<IUser, UserModel>("user", userSchema);
export default User;
