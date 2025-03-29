import { EventEmitter } from "events";
import { customAlphabet } from "nanoid";
import { hash } from "../hashing/hash.js";
import { UserModel } from "../../DB/Models/user.model.js";
import { sendEmails, subject } from "./sendEmail.js";
import { template } from "./generateHTML.js";
import * as dbService from "../../DB/dbService.js";
export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async (email, userName) => {
  const otp = customAlphabet("0123456789", 6)();
  const hashOTP = hash({ plainText: otp });
  await UserModel.updateOne({ email }, { confirmEmailOTP: hashOTP });

  await sendEmails({
    to: email,
    subject: subject.register,
    html: template(otp, userName, subject.register),
  });
});

emailEmitter.on("forgetPassword", async (email, userName) => {
  const otp = customAlphabet("0123456789", 6)();
  const hashOTP = hash({ plainText: otp });
  await UserModel.updateOne({ email }, { forgetPasswordOTP: hashOTP });
  await sendEmails({
    to: email,
    subject: subject.resetPassword,
    html: template(otp, userName, subject.resetPassword),
  });
});
