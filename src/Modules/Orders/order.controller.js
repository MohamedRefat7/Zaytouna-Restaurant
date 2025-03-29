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
  validation(orderValidation.createOrderSchema),
  asyncHandler(orderService.addOrder)
);

router.get(
  "/getAllOrders",
  authentication(),
  allowTo(["Admin"]),
  asyncHandler(orderService.getAllOrders)
);

router.get(
  "/getOrder/:id",
  authentication(),
  asyncHandler(orderService.getOrderById)
);

router.put(
  "/updateOrder/:id",
  authentication(),
  validation(orderValidation.updateOrderSchema),
  asyncHandler(orderService.updateOrder)
);

router.delete(
  "/deleteOrder/:id",
  authentication(),
  asyncHandler(orderService.deleteOrder)
);

export default router;
