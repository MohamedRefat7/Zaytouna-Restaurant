import { orderModel } from "../../DB/Models/order.model.js";
import { CartModel } from "../../DB/Models/cart.model.js";
import { menuModel } from "../../DB/Models/menu.model.js";
import { clearCart } from "./order.function.js";

export const addOrder = async (req, res, next) => {
  const { paymentMethod, phone } = req.body;
  //get product from cart
  const cart = await CartModel.findOne({ user: req.user._id });
  const menuItems = cart.menuItems;
  if (menuItems.length < 1)
    return next(new Error("Cart is empty", { cause: 400 }));

  let orderMenuItems = [];
  let orderPrice = 0;

  for (let i = 0; i < menuItems.length; i++) {
    const menuItem = await menuModel.findById(menuItems[i].menuItemId);
    if (!menuItem)
      return next(new Error("Menu item not found", { cause: 404 }));

    orderMenuItems.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: menuItems[i].quantity,
      price: menuItem.price,
      totalPrice: menuItem.price * menuItems[i].quantity,
    });
    orderPrice += menuItem.price * menuItems[i].quantity;
  }

  const order = await orderModel.create({
    user: req.user._id,
    menuItems: orderMenuItems,
    phone,
    paymentMethod,
    totalPrice: orderPrice,
  });

  clearCart(req.user._id);

  return res.status(201).json({ success: true, results: order });
};

export const cancelOrder = async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) return next(new Error("Invalid Order Id!"), { cause: 400 });

  if (
    order.status === "delivered" ||
    order.status === "preparing" ||
    order.status === "canceled"
  )
    return next(new Error("Can't cancel order!"), { cause: 400 });

  order.status = "canceled";
  await order.save();

  clearCart(order.user);

  return res.status(200).json({ success: true, message: "Order Canceled" });
};
