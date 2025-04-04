import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    menuItems: [
      {
        menuItemId: {
          type: Types.ObjectId,
          ref: "Menu",
        },
        quantity: { type: Number, min: 1 },
        price: { type: Number },
        name: String,
        totalPrice: { type: Number },
      },
    ],

    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "delivered", "canceled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "visa"],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const orderModel = mongoose.models.Order || model("Order", orderSchema);
