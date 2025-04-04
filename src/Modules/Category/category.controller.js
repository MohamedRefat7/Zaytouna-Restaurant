import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as categorySevice from "./category.service.js";
import * as categoryValidation from "./category.validation.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
import subCategoryRouter from "../subCategory/subCategory.controller.js";

const router = Router();

router.use("/:category/subCategory", subCategoryRouter);

router.post(
  "/addCategory",
  authentication(),
  allowTo(["Admin"]),
  uploadCloud().single("image"),
  validation(categoryValidation.createCategorySchema),
  asyncHandler(categorySevice.addCategory)
);

router.patch(
  "/updateCategory/:id",
  authentication(),
  allowTo(["Admin"]),
  uploadCloud().single("image"),
  validation(categoryValidation.updateCategorySchema),
  asyncHandler(categorySevice.updateCategory)
);

router.delete(
  "/deleteCategory/:id",
  authentication(),
  allowTo(["Admin"]),
  validation(categoryValidation.deleteCategorySchema),
  asyncHandler(categorySevice.deleteCategory)
);

router.get("/getAllCategories", asyncHandler(categorySevice.getAllCategories));

export default router;
