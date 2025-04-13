import mongoose, { Schema, model, Types } from "mongoose";

const menuSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["breakfast", "lunch", "dinner", "dessert", "drinks"],
    },
    image: {
      public_id: String,
      secure_url: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

menuSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "menu",
});

menuSchema.query.search = function (keyword) {
  if (keyword) {
    return this.where({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ],
    });
  }
  return this;
};

export const menuModel = mongoose.models.Menu || model("Menu", menuSchema);
