import mongoose, { Schema, Types, model } from "mongoose";

const cartSchema = new Schema(
  {
    menuItems: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: "Menu",
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export const CartModel = mongoose.models.Cart || model("Cart", cartSchema);
