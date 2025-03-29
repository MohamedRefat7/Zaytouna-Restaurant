import Joi from "joi";

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        menuItem: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
  totalPrice: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid("cash", "credit card").required(),
}).required();

export const updateOrderSchema = Joi.object({
  status: Joi.string().valid("pending", "preparing", "delivered", "canceled"),
  items: Joi.array().items(
    Joi.object({
      menuItem: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    })
  ),
});
