import { Router } from "express";
import * as adminService from "./admin.service.js";
import * as adminValidation from "./admin.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { changeRoleMiddleware } from "./admin.middleware.js";
const router = Router();

router.get(
  "/getUsers",
  authentication(),
  allowTo("Admin"),
  asyncHandler(adminService.getUsers)
);

router.get(
  "/getOrders",
  authentication(),
  allowTo("Admin"),
  asyncHandler(adminService.getOrders)
);
router.get(
  "/getOrders/:orderId",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.getOrderByIdSchema),
  asyncHandler(adminService.getOrderById)
);

router.patch(
  "/changeOrderStatus/:orderId",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.changeOrderStatusSchema),
  asyncHandler(adminService.changeOrderStatusById)
);

router.patch(
  "/changeRole",
  authentication(),
  allowTo(["Admin"]),
  validation(adminValidation.changeRoleSchema),
  changeRoleMiddleware,
  asyncHandler(adminService.changeRole)
);

export default router;
