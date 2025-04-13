import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as checkOutService from "./checkOut.service.js";
import * as checkOutValidation from "./checkOut.validation.js";

const router = Router();

router.post(
  "/addCheckOut",
  authentication(),
  allowTo(["User"]),
  validation(checkOutValidation.addCheckOutValidation),
  asyncHandler(checkOutService.addCheckOut)
);

router.get(
  "/getCheckOut",
  authentication(),
  allowTo(["User"]),
  asyncHandler(checkOutService.getCheckOut)
);


router.delete(
  "/cancelCheckOut/:id",
  authentication(),
  allowTo(["User"]),
  validation(checkOutValidation.cancelCheckOutValidation),
  asyncHandler(checkOutService.cancelCheckOut)
);

export default router;
