import { CheckOutModel } from "../../DB/Models/checkOut.model.js";
import { UserModel } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js";
import Stripe from "stripe";
export const addCheckOut = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { cart, date, guests, time, status, mealType, paymentMethod, info } =
      req.body;

    // Clone the cart to modify it safely
    const modifiedCart = { ...cart };

    // If cart is empty, add a deposit item
    if (!cart || !cart.items || cart.items.length === 0) {
      modifiedCart.items = [
        {
          menuItemId: "67fb568acfecf3cf2bba645d", // ID of the deposit item
          name: "Reservation Deposit",
          price: 200,
          quantity: 1,
        },
      ];
      modifiedCart.preOrder = true;
    }

    const user = await UserModel.findById(userId).select(
      "userName phoneNumberRaw email"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare the checkout object
    const checkOutData = {
      cart: {
        items: modifiedCart.items.map((item) => ({
          menu: item.menuItemId, // Keep it null or use a special ID for deposit
          quantity: item.quantity,
        })),
        preOrder: modifiedCart.preOrder || false,
      },
      date,
      guests: guests || 1,
      time,
      status: status || "pending",
      mealType,
      paymentMethod,
      user: userId,
      info: {
        name: info?.name?.trim() || user.userName,
        phone: user.phoneNumberRaw,
        message: info?.message || "No Notes",
        preference: info?.preference || "No Preference",
        email: info?.email || user.email,
      },
      createdBy: userId,
    };

    const checkOut = await dbService.create({
      model: CheckOutModel,
      data: checkOutData,
    });

    // Stripe logic if payment method is visa
    if (paymentMethod === "creditCard") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const orderMenuItems = modifiedCart.items.map((item) => ({
        name: item.name || "Unnamed Item",
        price: item.price,
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: orderMenuItems.map((item) => ({
          price_data: {
            currency: "egp",
            product_data: { name: item.name },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
      });

      return res.status(200).json({
        success: true,
        url: session.url,
        message: "Redirect to Stripe for payment",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Checkout Error",
      error: error.message,
    });
  }
};

export const getCheckOut = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId).select(
      "userName phoneNumberRaw email"
    );

    const checkOuts = await CheckOutModel.find({ createdBy: userId })
      .populate("cart.items.menu")
      .populate({path:"createdBy",select : "userName phoneNumberRaw"}) // Make sure your schema ref is correct
      .sort({ createdAt: -1 });


    if (!checkOuts || checkOuts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No checkouts found for this user" });
    }

    return res.status(200).json({
      success: true,
      message: "Checkouts retrieved successfully",
      results: checkOuts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve checkouts",
      error: error.message,
    });
  }
};

// delete checkOut if status is pending
export const cancelCheckOut = async (req, res, next) => {
  try {
    const checkOut = await CheckOutModel.findById(req.params.id);
    if (!checkOut) {
      return res
        .status(404)
        .json({ success: false, message: "CheckOut not found" });
    }
    if (checkOut.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "CheckOut cannot be cancelled" });
    }
    checkOut.status = "cancelled";
    await CheckOutModel.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "CheckOut cancelled successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve checkouts",
      error: error.message,
    });
  }
};
