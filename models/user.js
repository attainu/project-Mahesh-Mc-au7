import mongoose from "mongoose";
const Schema = mongoose.Schema;
//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import Token from "../models/token.js";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "Your email is required",
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      required: false,
      index: true,
      sparse: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
      required: "Your password is required",
      max: 100,
    },

    fullname: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://res.cloudinary.com/slyde/image/upload/v1593166367/avatar-default_sgnvcm.png",
    },
    banner: {
      type: String,
      default:
        "https://res.cloudinary.com/slyde/image/upload/v1593189063/FF7478_ctocbr.png",
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
      required: false,
    },

    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);
/*
UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    //err to error
    bcrypt.hash(user.password, salt, function (error, hash) {
      if (error) return next(error);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};*/

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  let payload = {
    id: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
  });
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.methods.generateVerificationToken = function () {
  let payload = {
    userId: this._id,
    token: crypto.randomBytes(20).toString("hex"),
  };

  return new Token(payload);
};

export default mongoose.model("User", UserSchema);
