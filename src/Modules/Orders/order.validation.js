import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const createOrderSchema = joi
  .object({
    paymentMethod: joi.string().valid("cash", "visa").required(),
    phone: joi.string().required(),
  })
  .required();

export const cancelOrderSchema = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
