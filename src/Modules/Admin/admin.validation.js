import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
import { roleType } from "../../DB/Models/user.model.js";

export const changeRoleSchema = joi
  .object({
    userId: joi.custom(isValidObjectId).required(), // or Email If you want
    // userEmail: joi.string().email().required(),
    role: joi
      .string()
      .valid(...Object.values(roleType))
      .required(),
  })
  .required();

export const changeOrderStatusSchema = joi
  .object({
    orderId: joi.custom(isValidObjectId).required(),
    status: joi
      .string()
      .valid("pending", "preparing", "delivered", "canceled")
      .required(),
  })
  .required();
export const getOrderByIdSchema = joi
  .object({
    orderId: joi.custom(isValidObjectId).required(),
  })
  .required();
