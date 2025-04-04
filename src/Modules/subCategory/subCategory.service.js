import * as dbService from "../../DB/dbService.js";
import slugify from "slugify";
import { subCategoryModel } from "../../DB/Models/subCategory.model.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
import { CategoryModel } from "../../DB/Models/category.model.js";

export const addSubCategory = async (req, res, next) => {
  const category = await CategoryModel.findById(req.params.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  if (!req.file) return next(new Error("subCategory Image is required"));

  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Zaytouna Restaurant/subCategory/${req.body.name}`,
    }
  );
  await dbService.create({
    model: subCategoryModel,
    data: {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      slug: slugify(req.body.name),
      createdBy: req.user._id,
      image: { public_id, secure_url },
      category: req.params.category,
    },
  });
  return res
    .status(201)
    .json({ success: true, message: "subCategory created successfully" });
};

export const updateSubCategory = async (req, res, next) => {
  //check Catgeory in DataBase
  const category = await CategoryModel.findById(req.params.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  //check subCategory in DataBase
  const subCategory = await subCategoryModel.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subCategory)
    return next(new Error("subCategory not found", { cause: 404 }));

  if (subCategory.createdBy.toString() !== req.user._id.toString())
    return next(
      new Error("You are not authorized to update this subCategory", {
        cause: 403,
      })
    );

  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: subCategory.image.public_id,
      }
    );
    subCategory.image = { public_id, secure_url };
  }
  subCategory.name = req.body.name ? req.body.name : subCategory.name;
  subCategory.slug = req.body.name ? slugify(req.body.name) : subCategory.slug;

  await subCategory.save();

  return res
    .status(200)
    .json({ success: true, message: "subCategory updated successfully" });
};

export const deleteSubCategory = async (req, res, next) => {
  const category = await CategoryModel.findById(req.params.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  const subCategory = await subCategoryModel.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subCategory)
    return next(new Error("subCategory not found", { cause: 404 }));

  if (subCategory.createdBy.toString() !== req.user._id.toString())
    return next(
      new Error("You are not authorized to update this subCategory", {
        cause: 403,
      })
    );

  //delete image from cloudinary
  await cloudinary.uploader.destroy(subCategory.image.public_id);

  await subCategoryModel.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json({ success: true, message: "subCategory deleted successfully" });
};

export const getAllSubCategories = async (req, res, next) => {
  let { page } = req.query;
  if (req.params.category) {
    const category = await CategoryModel.findById(req.params.category);
    if (!category) return next(new Error("Category not found", { cause: 404 }));

    const SubCategories = await subCategoryModel
      .find({
        category: req.params.category,
      })
      .paginate(page);
    return res.status(200).json({ success: true, results: SubCategories });
  }

  const SubCategories = await subCategoryModel
    .find({})
    .populate([
      {
        path: "category",
        select: "name",
        populate: {
          path: "createdBy",
          select: "userName email -phoneNumberRaw",
        },
      },
      { path: "createdBy", select: "userName -phoneNumberRaw" },
    ])
    .paginate(page);
  return res.status(200).json({ success: true, results: SubCategories });
};

/* export const getSubCategory = async (req, res, next) => {
  let { page } = req.query;

  const subCategoryItems = await subCategoryModel
    .find({ isDeleted: false })
    .paginate(page);
  return res.status(200).json({ success: true, results: subCategoryItems });
}; */
