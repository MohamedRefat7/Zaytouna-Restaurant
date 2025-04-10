import { CheckOutModel } from "../../DB/Models/checkOut.model.js";
import { CartModel } from "../../DB/Models/cart.model.js";
import { UserModel } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js";
import Stripe from "stripe";

export const addCheckOut = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get the user's cart
    const cart = await CartModel.findOne({ user: userId }).populate(
      "menuItems.menuItemId"
    ); // Populate menuItems with related menu item data
    if (!cart || cart.menuItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 2. Get the user info
    const user = await UserModel.findById(userId).select(
      "userName phoneNumberRaw"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3. Prepare the checkout object
    const checkOutData = {
      cart: {
        items: cart.menuItems.map((item) => ({
          menu: item.menuItemId, // Assuming menuItemId contains the full menu item data
          quantity: item.quantity,
        })),
        preOrder: cart.preOrder || false,
      },
      date: {
        calender: {
          day: req.body.date?.calender?.day || new Date().getDate(),
          month: req.body.date?.calender?.month || new Date().getMonth() + 1,
          year: req.body.date?.calender?.year || new Date().getFullYear(),
          era: req.body.date?.calender?.era || "AD",
        },
      },
      guests: req.body.guests || 1,
      time: req.body.time,
      status: req.body.status || "pending",
      mealType: req.body.mealType,
      paymentMethod: req.body.paymentMethod,
      user: userId,
      info: {
        name: user.userName,
        phone: user.phoneNumberRaw,
        message: req.body.info?.message || "",
        prefernece: req.body.info?.prefernece || "",
      },
      createdBy: userId,
    };

    // 4. Save to DB
    const checkOut = await dbService.create({
      model: CheckOutModel,
      data: checkOutData,
    });

    // 5. If payment method is "visa", create Stripe session
    if (req.body.paymentMethod === "visa") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // Map the menu items for Stripe's line_items format
      const orderMenuItems = cart.menuItems.map((item) => ({
        name: item.menuItemId.name,
        price: item.menuItemId.price,
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: orderMenuItems.map((item) => ({
          price_data: {
            currency: "egp",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100, // Convert to cents
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: process.env.SUCCESS_URL, // from Frontend
        cancel_url: process.env.CANCEL_URL, // from Frontend
      });

      // Return the Stripe session URL to the frontend
      return res.status(200).json({
        success: true,
        url: session.url,
        message: "Redirect to Stripe for payment",
        results: checkOut, // Include checkout data if needed
      });
    }

    // 6. If no payment method or method other than "visa", respond with success
    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      results: checkOut,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getCheckOut = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get the user's checkouts
    const checkOuts = await CheckOutModel.find({ user: userId }).populate(
      "cart.items.menu"
    );

    // 2. Check if there are any checkouts
    if (!checkOuts || checkOuts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No checkouts found" });
    }

    // 3. Return the checkouts
    return res.status(200).json({
      success: true,
      message: "Checkouts retrieved successfully",
      results: checkOuts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
