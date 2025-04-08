import { orderModel } from "../../DB/Models/order.model.js";
import { CartModel } from "../../DB/Models/cart.model.js";
import { menuModel } from "../../DB/Models/menu.model.js";
import { clearCart } from "./order.function.js";
import Stripe from "stripe";

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

  //payment
  if (paymentMethod === "visa") {
    //stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderMenuItems.map((item) => ({
        price_data: {
          currency: "egp",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: process.env.SUCCESS_URL, //from Frontend
      cancel_url: process.env.CANCEL_URL, //from Frontend
    });
    return res
      .status(200)
      .json({ success: true, url: session.url, result: order });
  }
  return res.status(200).json({ success: true, results: order });
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
