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
  "/getUser/:userId",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.getUserByIdSchema),
  asyncHandler(adminService.getUserById)
);

router.get(
  "/getUserByEmail",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.getUserByEmailSchema),
  asyncHandler(adminService.getUserByEmail)
);

router.get(
  "/getAdmins",
  authentication(),
  allowTo("Admin"),
  asyncHandler(adminService.getAdmins)
);

router.get(
  "/getCheckOut",
  authentication(),
  allowTo("Admin"),
  asyncHandler(adminService.getCheckOut)
);

router.get(
  "/getCheckOut/:checkOutId",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.getCheckOutByIdSchema),
  asyncHandler(adminService.getCheckOutById)
);

router.patch(
  "/changeCheckOutStatus/:checkOutId",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.changeCheckOutStatusSchema),
  asyncHandler(adminService.changeCheckOutStatusById)
);

router.patch(
  "/changeRole",
  authentication(),
  allowTo(["Admin"]),
  validation(adminValidation.changeRoleSchema),
  changeRoleMiddleware,
  asyncHandler(adminService.changeRole)
);

//delete user
router.delete(
  "/deleteUser/:userId",
  authentication(),
  allowTo("Admin"),
  validation(adminValidation.deleteUserSchema),
  asyncHandler(adminService.deleteUser)
);

export default router;
