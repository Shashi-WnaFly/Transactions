import mongoose, { Schema } from "mongoose";
import validator from "validator";

const userSchema = new Schema({
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
    unique: true,
    maxLength: 100,
    lowercase: true,
    validate: (value: string) => {
      if (!validator.isEmail(value)) throw new Error("Email Id is Invalid!!");
    },
  },
  mobileNo: {
    type: String,
    unique: true,
    minLength: 10,
    maxLength: 10,
    required: [true, "User phone number required!"],
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
  },
  otpExpiredAt: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
    trim: true,
  },
  resetPasswordTokenExpireAt: {
    type: Date,
    default: null,
  },
}, {timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;
