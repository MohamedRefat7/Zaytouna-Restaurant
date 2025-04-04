import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createCategorySchema = joi
  .object({
    name: joi.string().min(3).max(20).trim().required(),
    file: joi.any(),
  })
  .required();

export const updateCategorySchema = joi
  .object({
    name: joi.string().min(3).max(20).trim(),
    id: joi.string().custom(isValidObjectId).required(),
    file: joi.any(),
  })
  .required();

export const deleteCategorySchema = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
