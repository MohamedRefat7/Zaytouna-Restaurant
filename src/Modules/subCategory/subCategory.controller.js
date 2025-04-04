import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as subCategorySevice from "./subCategory.service.js";
import * as subCategoryValidation from "./subCategory.validaton.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
//localhost/category/:categoryId/subCategory
const router = Router({ mergeParams: true });

router.post(
  "/addSubCategory",
  authentication(),
  allowTo(["Admin"]),
  uploadCloud().single("image"),
  validation(subCategoryValidation.createCategorySchema),
  asyncHandler(subCategorySevice.addSubCategory)
);

router.patch(
  "/updateSubCategory/:id",
  authentication(),
  allowTo(["Admin"]),
  uploadCloud().single("image"),
  validation(subCategoryValidation.updateSubCategorySchema),
  asyncHandler(subCategorySevice.updateSubCategory)
);

router.delete(
  "/deleteSubCategory/:id",
  authentication(),
  allowTo(["Admin"]),
  validation(subCategoryValidation.deleteSubCategorySchema),
  asyncHandler(subCategorySevice.deleteSubCategory)
);

router.get(
  "/getAllSubCategories",
  validation(subCategoryValidation.getAllSubCategoriesSchema),
  asyncHandler(subCategorySevice.getAllSubCategories)
);

// router.get("/getSubCategory", asyncHandler(subCategorySevice.getSubCategory));

export default router;
