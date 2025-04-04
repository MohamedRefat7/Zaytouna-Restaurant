import * as dbService from "../../DB/dbService.js";
import slugify from "slugify";
import { CategoryModel } from "../../DB/Models/category.model.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";

export const addCategory = async (req, res, next) => {
  if (!req.file) return next(new Error("Image is required"));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Zaytouna Restaurant/Category/${req.body.name}`,
    }
  );
  await dbService.create({
    model: CategoryModel,
    data: {
      name: req.body.name,
      slug: slugify(req.body.name),
      createdBy: req.user._id,
      image: { public_id, secure_url },
    },
  });
  return res
    .status(201)
    .json({ success: true, message: "Category created successfully" });
};

export const updateCategory = async (req, res, next) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  if (category.createdBy.toString() !== req.user._id.toString())
    return next(
      new Error("You are not authorized to update this category", {
        cause: 403,
      })
    );

  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: category.image.public_id,
      }
    );
    category.image = { public_id, secure_url };
  }
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  await category.save();

  return res
    .status(200)
    .json({ success: true, message: "Category updated successfully" });
};

export const deleteCategory = async (req, res, next) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  if (category.createdBy.toString() !== req.user._id.toString())
    return next(
      new Error("You are not authorized to delete this category", {
        cause: 403,
      })
    );
  //delete image from cloudinary
  await cloudinary.uploader.destroy(category.image.public_id);

  await CategoryModel.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json({ success: true, message: "Category deleted successfully" });
};

export const getAllCategories = async (req, res, next) => {
  const categories = await CategoryModel.find({}).populate([
    { path: "createdBy", select: "userName -phoneNumberRaw" },
    { path: "subCategory" },
  ]);
  return res.status(200).json({ success: true, results: categories });
};
