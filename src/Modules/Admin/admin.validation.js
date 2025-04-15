import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
import { roleType } from "../../DB/Models/user.model.js";

export const getUserByIdSchema = joi
  .object({
    userId: joi.custom(isValidObjectId).required(),
  })
  .required();

export const getUserByEmailSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const changeRoleSchema = joi
  .object({
    userId: joi.custom(isValidObjectId).required(), // or Email If you want
    role: joi
      .string()
      .valid(...Object.values(roleType))
      .required(),
  })
  .required();

export const changeCheckOutStatusSchema = joi
  .object({
    checkOutId: joi.custom(isValidObjectId).required(),
    status: joi
      .string()
      .valid("pending", "preparing", "delivered", "canceled")
      .required(),
  })
  .required();

export const getCheckOutByIdSchema = joi
  .object({
    checkOutId: joi.custom(isValidObjectId).required(),
  })
  .required();

export const deleteUserSchema = joi
  .object({
    userId: joi.custom(isValidObjectId).required(),
  })
  .required();
