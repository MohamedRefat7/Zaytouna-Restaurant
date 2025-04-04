import Joi from "joi";

export const createMenuSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  description: Joi.string().max(500).trim(),
  price: Joi.number().min(0).max(10000).required(),
  category: Joi.string()
    .valid("breakfast", "lunch", "dinner", "dessert", "drinks")
    .required(),
}).required();
