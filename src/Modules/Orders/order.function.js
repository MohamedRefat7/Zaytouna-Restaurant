import { CartModel } from "../../DB/Models/cart.model.js";

export const clearCart = async (userId) => {
  await CartModel.findOneAndUpdate({ user: userId }, { menuItems: [] });
};
