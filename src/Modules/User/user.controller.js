import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as userService from "./user.service.js";
import * as userValidation from "./user.validation.js";

const router = Router();

router.get(
  "/profile",
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.getProfile)
);
//get all profiles and admin only can access this route
router.get(
  "/allProfiles",
  authentication(),
  allowTo(["Admin"]),
  asyncHandler(userService.getAllProfiles)
);
router.patch(
  "/updateProfile",
  validation(userValidation.updateProfileSchema),
  authentication(),
  allowTo(["User", "Admin"]),
  asyncHandler(userService.updateProfile)
);

router.delete(
  "/deleteProfile",
  authentication(),
  asyncHandler(userService.deleteProfile)
);
export default router;
