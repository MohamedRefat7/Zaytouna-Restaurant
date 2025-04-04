import { Router } from "express";
import { authentication, allowTo } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as orderService from "./order.service.js";
import * as orderValidation from "./order.validation.js";

const router = Router();

router.post(
  "/addOrder",
  authentication(),
  allowTo(["User"]),
  validation(orderValidation.createOrderSchema),
  asyncHandler(orderService.addOrder)
);

router.patch(
  "/cancelOrder/:id",
  authentication(),
  allowTo(["User"]),
  validation(orderValidation.cancelOrderSchema),
  asyncHandler(orderService.cancelOrder)
);

export default router;
