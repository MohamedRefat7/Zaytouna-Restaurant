import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const addToCartSchema = joi
  .object({
    menuItemId: joi.string().custom(isValidObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

export const getCartSchema = joi
  .object({
    cartId: joi.string().custom(isValidObjectId),
  })
  .required();

export const updateCartSchema = joi
  .object({
    menuItemId: joi.string().custom(isValidObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

export const removeFromCartSchema = joi
  .object({
    menuItemId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
