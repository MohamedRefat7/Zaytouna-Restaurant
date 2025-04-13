import { UserModel } from "../../DB/Models/user.model.js";
import { orderModel } from "../../DB/Models/order.model.js";
import { CheckOutModel } from "../../DB/Models/checkOut.model.js";
import * as dbservice from "../../DB/dbService.js";
import { emailEmitter } from "../../utils/email/email.event.js";
import {
  sendSMSMessage,
  sendWhatsAppMessage,
} from "../../utils/twilio/twilio.js";

export const getUsers = async (req, res, next) => {
  let { page, keyword } = req.query;

  const results = await UserModel.find({ role: "User" })
    .search(keyword)
    .paginate(page);

  if (!results || results.length === 0)
    return next(new Error("No users found", { cause: 404 }));

  return res.status(200).json({ success: true, results });
};

export const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  const user = await dbservice.findById({
    model: UserModel,
    id: { _id: userId },
    select: "userName email role phoneNumberRaw confirmEmail ",
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  return res.status(200).json({ success: true, user });
};

export const getUserByEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await dbservice.findOne({
    model: UserModel,
    filter: { email },
    select: "userName email role phoneNumberRaw confirmEmail ",
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  return res.status(200).json({ success: true, user });
};

export const getAdmins = async (req, res, next) => {
  let { page, keyword } = req.query;

  const results = await UserModel.find({ role: "Admin" })
    .search(keyword)
    .paginate(page);

  if (!results || results.length === 0)
    return next(new Error("No admins found", { cause: 404 }));

  return res.status(200).json({ success: true, results });
};

export const getCheckOut = async (req, res, next) => {
  const results = await CheckOutModel.find({});

  if (!results) return next(new Error("No CheckOut found", { cause: 404 }));

  return res.status(200).json({ success: true, results });
};

export const getCheckOutById = async (req, res, next) => {
  const { checkOutId } = req.params;

  const checkOut = await dbservice.findById({
    model: CheckOutModel,
    id: { _id: checkOutId },
  });

  if (!checkOut)
    return next(
      new Error("CheckOut not found Or Id Is Not valid", { cause: 404 })
    );

  return res.status(200).json({ success: true, checkOut });
};

//send email
export const changeCheckOutStatusById = async (req, res, next) => {
  const { checkOutId } = req.params;
  const { status } = req.body;

  const checkOut = await dbservice.findOneAndUpdate({
    model: CheckOutModel,
    filter: { _id: checkOutId, isDeleted: false },
    data: { status },
    options: { new: true },
  });

  if (!checkOut)
    return next(new Error("checkOut not found Or Is Deleted", { cause: 404 }));

  if (status === "delivered" || status === "canceled") {
    const userEmail = checkOut.info.email;
    const userName = checkOut.info.name;

    // Emit event to send email
    emailEmitter.emit("sendStatusUpdateEmail", userEmail, userName, status);

    const message = `Hello, your checkout with ID ${checkOutId} has been ${status}.`;
    // // Send SMS message to the user
    const formattedPhoneNumber = `+20${checkOut.info.phone.slice(1)}`; // Assuming it's an Egyptian number
    await sendSMSMessage(formattedPhoneNumber, message);
    // send message by whatsapp
    await sendWhatsAppMessage(
      formattedPhoneNumber,
      `Hello ${userName}, your checkout with Date ${checkOut.date.day}/${checkOut.date.month}/${checkOut.date.year} in Time ${checkOut.time} has been ${status}.`
    );
  }

  return res.status(200).json({ success: true, checkOut });
};

//send on whatsapp
/* export const changeCheckOutStatusById = async (req, res, next) => {
  const { checkOutId } = req.params;
  const { status } = req.body;

  const checkOut = await dbservice.findOneAndUpdate({
    model: CheckOutModel,
    filter: { _id: checkOutId, isDeleted: false },
    data: { status },
    options: { new: true },
  });

  if (!checkOut)
    return next(new Error("checkOut not found Or Is Deleted", { cause: 404 }));

  if (status === "delivered" || status === "canceled") {
    const message = `Hello, your checkout with ID ${checkOutId} has been ${status}.`;
    // // Send SMS message to the user
    const formattedPhoneNumber = `+20${checkOut.info.phone.slice(1)}`; // Assuming it's an Egyptian number
    await sendSMSMessage(formattedPhoneNumber, message);
  }

  return res.status(200).json({ success: true, checkOut });
}; */

export const changeRole = async (req, res, next) => {
  // change role
  const { userId, role } = req.body;

  const user = await dbservice.findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId },
    data: { role },
    options: { new: true },
    select: "name email role",
  });

  return res.status(200).json({ success: true, user });
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  const currentAdminId = req.user._id; // The logged-in admin's ID

  const user = await dbservice.findById({
    model: UserModel,
    id: { _id: userId },
  });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // Prevent an Admin from deleting themselves
  if (user._id.toString() === currentAdminId.toString()) {
    return next(new Error("You cannot delete yourself", { cause: 403 }));
  }

  // Prevent deleting Admins
  if (user.role === "Admin") {
    return next(new Error("Cannot delete an Admin", { cause: 403 }));
  }

  // Delete the user if all checks pass
  await dbservice.findByIdAndDelete({
    model: UserModel,
    id: { _id: userId },
    options: { new: true },
  });

  return res.status(200).json({ success: true, message: "User deleted" });
};
