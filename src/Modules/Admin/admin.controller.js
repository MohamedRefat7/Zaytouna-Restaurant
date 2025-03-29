import { Router } from "express";
import * as adminService from "./admin.service.js";
import * as adminValidation from "./admin.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { changeRoleMiddleware } from "./admin.middleware.js";
const router = Router();

router.get(
  "/",
  authentication(),
  allowTo("Admin"),
  asyncHandler(adminService.getUsersAndOrders)
);

router.patch(
  "/role",
  authentication(),
  allowTo(["Admin"]),
  validation(adminValidation.changeRoleSchema),
  changeRoleMiddleware,
  asyncHandler(adminService.changeRole)
);

export default router;
