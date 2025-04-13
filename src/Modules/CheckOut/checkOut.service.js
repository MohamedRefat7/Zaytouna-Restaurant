import { CheckOutModel } from "../../DB/Models/checkOut.model.js";
import { UserModel } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js";
import Stripe from "stripe";

// export const addCheckOut = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     let cartItems = [];
//     let menuItemsForStripe = [];

//     // Check if cart items were sent in the request
//     if (req.body.cart && req.body.cart.length > 0) {
//       // Use cart from request
//       const populatedCartItems = await Promise.all(
//         req.body.cart.map(async (item) => {
//           // Fetch menu item details for each item in the cart
//           const menuItem = await MenuModel.findById(item.menuItemId);
//           if (!menuItem) {
//             return null; // Skip invalid menu items
//           }

//           // Store menu item with full details for Stripe
//           menuItemsForStripe.push({
//             name: menuItem.name,
//             price: menuItem.price,
//             quantity: item.quantity || 1
//           });

//           return {
//             menu: menuItem._id,
//             quantity: item.quantity || 1
//           };
//         })
//       );

//       // Filter out any null values (invalid menu items)
//       cartItems = populatedCartItems.filter(item => item !== null);

//       if (cartItems.length === 0) {
//         return res.status(400).json({ success: false, message: "No valid items in cart" });
//       }
//     } else {
//       // Fallback to getting cart from database
//       const cart = await CartModel.findOne({ user: userId }).populate(
//         "menuItems.menuItemId"
//       );

//       if (!cart || cart.menuItems.length === 0) {
//         return res.status(400).json({ success: false, message: "Cart is empty" });
//       }

//       cartItems = cart.menuItems.map((item) => ({
//         menu: item.menuItemId._id,
//         quantity: item.quantity,
//       }));

//       // Store menu items for Stripe
//       menuItemsForStripe = cart.menuItems.map((item) => ({
//         name: item.menuItemId.name,
//         price: item.menuItemId.price,
//         quantity: item.quantity,
//       }));
//     }

//     // 2. Get the user info
//     const user = await UserModel.findById(userId).select(
//       "userName phoneNumberRaw"
//     );
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // 3. Prepare the checkout object
//     const checkOutData = {
//       cart: {
//         items: cartItems,
//         preOrder: req.body.preOrder || false,
//       },
//       date: {
//         calendar: {
//           identifier: req.body.date?.calendar?.identifier || req.body.date?.calendar?.identifier,
//         },
//         day: req.body.date?.day || new Date().getDate(),
//         month: req.body.date?.month || new Date().getMonth() + 1,
//         year: req.body.date?.year || new Date().getFullYear(),
//         era: req.body.date?.era || "AD",
//       },
//       guests: req.body.guests || 1,
//       time: req.body.time,
//       status: req.body.status || "pending",
//       mealType: req.body.mealType,
//       paymentMethod: req.body.paymentMethod,
//       user: userId,
//       info: {
//         name: req.body.info?.name || user.userName,
//         phone: req.body.info?.phone || user.phoneNumberRaw,
//         message: req.body.info?.message || "",
//         preference: req.body.info?.preference || "",
//       },
//       createdBy: userId,
//     };

//     // 4. Save to DB
//     const checkOut = await dbService.create({
//       model: CheckOutModel,
//       data: checkOutData,
//     });

//     // 5. If payment method is "visa", create Stripe session
//     if (req.body.paymentMethod === "creditCard") {
//       const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: menuItemsForStripe.map((item) => ({
//           price_data: {
//             currency: "egp",
//             product_data: {
//               name: item.name,
//             },
//             unit_amount: item.price * 100, // Convert to cents
//           },
//           quantity: item.quantity,
//         })),
//         mode: "payment",
//         success_url: process.env.SUCCESS_URL, // from Frontend
//         cancel_url: process.env.CANCEL_URL, // from Frontend
//       });

//       // Return the Stripe session URL to the frontend
//       return res.status(200).json({
//         success: true,
//         url: session.url,
//         message: "Redirect to Stripe for payment",
//         results: checkOut, // Include checkout data if needed
//       });
//     }

//     // 6. If no payment method or method other than "visa", respond with success
//     return res.status(201).json({
//       success: true,
//       message: "Reservation created successfully",
//       results: checkOut,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server Error", error: error.message });
//   }
// };

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
      date: {
        calendar: {
          identifier: date?.calendar?.identifier,
        },
        day: date?.calendar?.day || new Date().getDate(),
        month: date?.calendar?.month || new Date().getMonth() + 1,
        year: date?.calendar?.year || new Date().getFullYear(),
        era: date?.calendar?.era || "AD",
      },
      guests: guests || 1,
      time,
      status: status || "pending",
      mealType,
      paymentMethod,
      user: userId,
      info: {
        name: user.userName,
        phone: user.phoneNumberRaw,
        message: info?.message || "",
        preference: info?.preference || "",
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

    const checkOuts = await CheckOutModel.find({ createdBy: userId })
      .populate("cart.items.menu") // Make sure your schema ref is correct
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
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
