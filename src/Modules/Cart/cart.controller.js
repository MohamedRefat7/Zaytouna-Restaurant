import { Router } from "express";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as cartService from "./cart.service.js";
import * as cartValidation from "./cart.validation.js";

const router = Router();

router.post(
  "/addToCart",
  authentication(),
  allowTo(["User"]),
  validation(cartValidation.addToCartSchema),
  asyncHandler(cartService.addToCart)
);

router.get(
  "/getCart",
  authentication(),
  allowTo(["User", "Admin"]),
  validation(cartValidation.getCartSchema),
  asyncHandler(cartService.getCart)
);

router.patch(
  "/updateCart",
  authentication(),
  allowTo(["User"]),
  validation(cartValidation.updateCartSchema),
  asyncHandler(cartService.updateCart)
);

router.patch(
  "/removeFromCart",
  authentication(),
  allowTo(["User"]),
  validation(cartValidation.removeFromCartSchema),
  asyncHandler(cartService.removeFromCart)
);

router.put(
  "/clearCart",
  authentication(),
  allowTo(["User"]),
  asyncHandler(cartService.clearCart)
);
export default router;
