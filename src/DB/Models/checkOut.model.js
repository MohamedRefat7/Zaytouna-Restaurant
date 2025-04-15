import mongoose, { Schema, model, Types } from "mongoose";

const checkOutSchema = new Schema(
  {
    cart: {
      items: [
        {
          menu: { type: Types.ObjectId, ref: "Menu" },
          quantity: { type: Number, default: 1 },
        },
      ],
      preOrder: {
        type: Boolean,
        default: false,
      },
    },
    date: String,
    guests: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    info: {
      message: String,
      phone: String,
      name: String,
      preference: String,
      email: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "dessert", "drinks"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "creditCard"],
    },
    time: {
      type: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
export const CheckOutModel =
  mongoose.models.CheckOut || model("CheckOut", checkOutSchema);
