import Joi from "joi";

export const addCheckOutValidation = Joi.object({
  date: Joi.object({
    calender: Joi.object({
      day: Joi.number().required().min(1).max(31), // Date should be between 1 and 31
      month: Joi.number().required().min(1).max(12), // Month should be between 1 and 12
      year: Joi.number().required().min(1900).max(2100), // Year range from 1900 to 2100
      era: Joi.string().valid("BC", "AD").required(), // Era is either BC or AD
    }).required(),
  }).required(),

  guests: Joi.number().default(1).min(1), // Guests should be at least 1

  info: Joi.object({
    message: Joi.string().optional(), // Optional message
    phone: Joi.string().pattern(/^\d+$/).optional(), // Optional phone number, allowing only digits
    name: Joi.string().optional(), // Optional name
    prefernece: Joi.string().optional(), // Optional preference
  }).optional(),

  status: Joi.string()
    .valid("pending", "confirmed", "cancelled")
    .default("pending"),

  mealType: Joi.string()
    .valid("breakfast", "lunch", "dinner", "dessert", "drinks")
    .optional(),

  paymentMethod: Joi.string().valid("cash", "visa").required(), // Payment method is required

  time: Joi.string().required(),
}).required();
