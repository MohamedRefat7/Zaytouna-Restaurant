import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
const router = Router();

router.post(
  "/signup",
  validation(authValidation.registerSchema),
  asyncHandler(authService.register)
);

router.patch(
  "/confirmEmail",
  validation(authValidation.confirmEmailSchema),
  asyncHandler(authService.confirmEmail)
);

router.post(
  "/signin",
  validation(authValidation.loginSchema),
  asyncHandler(authService.login)
);

router.post("/loginWithGmail", asyncHandler(authService.loginWithGmail));

router.get("/refreshToken", asyncHandler(authService.refreshToken));

router.patch(
  "/forgetPassword",
  validation(authValidation.forgetPasswordSchema),
  asyncHandler(authService.forgetPassword)
);

router.patch(
  "/resetPassword",
  validation(authValidation.resetPasswordSchema),
  asyncHandler(authService.resetPassword)
);

export default router;
