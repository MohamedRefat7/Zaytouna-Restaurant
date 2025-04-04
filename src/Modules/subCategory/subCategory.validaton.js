import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCategorySchema = joi
  .object({
    name: joi.string().min(3).max(20).trim().required(),
    description: joi.string().max(500).trim().required(),
    price: joi.number().min(0).max(10000).required(),
    category: joi.string().custom(isValidObjectId).required(),
    file: joi.any(),
  })
  .required();

export const updateSubCategorySchema = joi
  .object({
    name: joi.string().min(3).max(20).trim(),
    id: joi.string().custom(isValidObjectId).required(),
    category: joi.string().custom(isValidObjectId).required(),
    file: joi.any(),
  })
  .required();

export const deleteSubCategorySchema = joi.object({
  id: joi.string().custom(isValidObjectId).required(),
  category: joi.string().custom(isValidObjectId).required(),
});

export const getAllSubCategoriesSchema = joi
  .object({
    category: joi.string().custom(isValidObjectId),
    page: joi.number().integer().min(1).optional(),
  })
  .required();
