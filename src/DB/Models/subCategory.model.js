import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      min: 3,
      max: 20,
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

    slug: { type: String, required: true, unique: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    // updatedBy: { type: Types.ObjectId, ref: "User" },
    image: { public_id: String, secure_url: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: { type: Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

subCategorySchema.query.paginate = async function (page) {
  page = page ? page : 1;
  const limit = 3;
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
    nextPage: Number(page) + 1,
    prevPage: page - 1,
  };
};

export const subCategoryModel =
  mongoose.model.Category || model("SubCategory", subCategorySchema);
