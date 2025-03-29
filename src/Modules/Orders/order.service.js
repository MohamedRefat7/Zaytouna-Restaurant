import { orderModel } from "../../DB/Models/order.model.js";
import * as dbService from "../../DB/dbService.js";

export const addOrder = async (req, res, next) => {
  const { items, totalPrice, paymentMethod } = req.body;
  const customerId = req.user._id; // Assuming authentication middleware sets req.user

  const order = await dbService.create({
    model: orderModel,
    data: { customer: customerId, items, totalPrice, paymentMethod },
  });

  return res.status(201).json({ success: true, results: order });
};

export const getAllOrders = async (req, res, next) => {
  let orders = await orderModel
    .find()
    .populate({
      path: "customer",
      select: "userName" + (req.user.role === "Admin" ? " phoneNumberRaw" : ""),
    })
    .populate("items.menuItem");

  return res.status(200).json({ success: true, results: orders });
};

export const getOrderById = async (req, res, next) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate("items.menuItem");
  if (!order || order.isDeleted) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }
  return res.status(200).json({ success: true, results: order });
};

export const updateOrder = async (req, res, next) => {
  const { items } = req.body;
  const order = await orderModel.findById(req.params.id);

  if (!order || order.isDeleted) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  // Users can only update pending orders
  if (req.user.role === "User") {
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this order.",
      });
    }
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "You can only update a pending order.",
      });
    }
  }

  // Update only allowed fields (items)
  if (items) {
    order.items = items;

    // Recalculate total price
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += item.price * item.quantity;
    }
    order.totalPrice = totalPrice;
  }

  await order.save();

  return res.status(200).json({ success: true, results: order });
};

export const deleteOrder = async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order || order.isDeleted) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  order.isDeleted = true;
  await order.save();

  return res
    .status(200)
    .json({ success: true, message: "Order deleted successfully." });
};
