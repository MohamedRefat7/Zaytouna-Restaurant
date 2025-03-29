import mongoose, { Schema, model } from "mongoose";

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
      enum: ["breakfast", "lunch", "dinner", "dessert"],
    },
    image: {
      public_id: String,
      secure_url: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

menuSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "menu",
});

menuSchema.query.paginate = async function (page) {
  page = page ? page : 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  //data , currentpage, totalpages, totalitems, itemsperpage, nextpage, prevpage
  const data = await this.skip(skip).limit(limit);
  const items = await this.model.countDocuments();

  return {
    data,
    currentPage: Number(page),
    totalPages: Math.ceil(items / limit),
    totalItems: items,
    itemsPerPage: data.length,
    nextPage: page + 1,
    prevPage: page - 1,
  };
};

export const menuModel = mongoose.models.Menu || model("Menu", menuSchema);
