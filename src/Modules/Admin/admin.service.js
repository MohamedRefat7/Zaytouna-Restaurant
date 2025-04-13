import { UserModel } from "../../DB/Models/user.model.js";
import { orderModel } from "../../DB/Models/order.model.js";
import * as dbservice from "../../DB/dbService.js";
export const getUsers = async (req, res, next) => {
  let { page, keyword } = req.query;

  const results = await Promise.all([
    UserModel.find({}).search(keyword),
  ]);
  if (!results) return next(new Error("No users found", { cause: 404 }));

  return res.status(200).json({ success: true, results });
};

export const getOrders = async (req, res, next) => {
  let { page } = req.query;

  const results = await Promise.all([orderModel.find({})]);

  if (!results) return next(new Error("No orders found", { cause: 404 }));

  return res.status(200).json({ success: true, results });
};

export const getOrderById = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await dbservice.findById({
    model: orderModel,
    id: { _id: orderId },
  });

  if (!order) return next(new Error("Order not found", { cause: 404 }));

  return res.status(200).json({ success: true, order });
};

export const changeOrderStatusById = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await dbservice.findOneAndUpdate({
    model: orderModel,
    filter: { _id: orderId },
    data: { status },
    options: { new: true },
  });

  if (!order) return next(new Error("Order not found", { cause: 404 }));

  return res.status(200).json({ success: true, order });
};

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
