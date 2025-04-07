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

orderSchema.query.paginate = async function (page) {
  page = page ? page : 1;
  const limit = 3;
  const skip = (page - 1) * limit;
  //data , currentpage, totalpages, totalorders, ordersperpage, nextpage, prevpage
  const data = await this.skip(skip).limit(limit);
  const orders = await this.model.countDocuments();

  return {
    data,
    currentPage: Number(page),
    totalPages: Math.ceil(orders / limit),
    totalOrders: orders,
    ordersPerPage: data.length,
    nextPage: Number(page) + 1,
    prevPage: page - 1,
  };
};

export const orderModel = mongoose.models.Order || model("Order", orderSchema);
