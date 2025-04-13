import { Router } from "express";
import { allowTo, authentication } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
import * as menuService from "./menu.service.js";
import * as menuValidation from "./menu.validation.js";

const router = Router();

router.post(
  "/addMenu",
  authentication(),
  allowTo(["Admin"]),
  uploadCloud().single("image"),
  asyncHandler(menuService.addMenu)
);

router.get("/getMenu", authentication(), asyncHandler(menuService.getMenu));
router.get("/getMenuStatic", asyncHandler(menuService.getMenu));
router.get(
  "/getMenuItem/:id",
  authentication(),
  asyncHandler(menuService.getMenuById)
);

router.put(
  "/updateMenuItem/:id",
  authentication(),
  allowTo(["Admin"]),
  uploadCloud().single("image"),
  asyncHandler(menuService.updateMenu)
);

router.delete(
  "/deleteMenuItem/:id",
  authentication(),
  allowTo(["Admin"]),
  asyncHandler(menuService.deleteMenu)
);

export default router;
