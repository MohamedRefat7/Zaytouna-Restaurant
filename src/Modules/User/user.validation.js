import joi from "joi";
import { generalField } from "../../middleware/validation.middleware.js";

export const shareProfileSchema = joi
  .object({
    profileId: generalField.id.required(),
  })
  .required();

export const updateProfileSchema = joi
  .object({
    userName: generalField.userName,
    phoneNumber: generalField.phoneNumber,
    password: generalField.password,
    confirmPassword: generalField.confirmPassword,
  })
  .required();
