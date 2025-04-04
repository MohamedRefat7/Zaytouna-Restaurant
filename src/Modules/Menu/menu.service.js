import { menuModel } from "../../DB/Models/menu.model.js";
import * as dbService from "../../DB/dbService.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";

export const addMenu = async (req, res, next) => {
  const { name, description, price, category } = req.body;

  let image = {};
  if (req.file) {
    try {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: `Zaytouna Restaurant/Menu/${category}`, // Folder based on category
      });
      image = {
        public_id: uploadedImage.public_id,
        secure_url: uploadedImage.secure_url,
      };
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Image upload failed", error });
    }
  }

  try {
    const menu = await dbService.create({
      model: menuModel,
      data: { name, description, price, category, image },
    });

    return res.status(201).json({ success: true, results: menu });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Menu creation failed", error });
  }
};

export const getMenu = async (req, res, next) => {
  let { sort, page, keyword } = req.query;

  const menuItems = await menuModel
    .find({ ...req.query })
    .sort(sort)
    .search(keyword)
    .paginate(page);
  return res.status(200).json({ success: true, results: menuItems });
};

export const getMenuById = async (req, res, next) => {
  const menuItem = await menuModel.findById(req.params.id);
  if (!menuItem || menuItem.isDeleted) {
    return res
      .status(404)
      .json({ success: false, message: "Menu item not found." });
  }
  return res.status(200).json({ success: true, results: menuItem });
};

export const updateMenu = async (req, res, next) => {
  try {
    const { name, description, price, category } = req.body;

    const menu = await menuModel.findById(req.params.id);
    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found." });
    }

    const updatedCategory = category || menu.category;

    let updateData = { name, description, price, category: updatedCategory };

    if (req.file) {
      if (menu.image?.public_id) {
        await cloudinary.uploader.destroy(menu.image.public_id); // Delete old image
      }

      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: `Zaytouna Restaurant/Menu/${updatedCategory}`,
      });

      updateData.image = {
        public_id: uploadedImage.public_id,
        secure_url: uploadedImage.secure_url,
      };
    }

    const updatedMenu = await menuModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    return res.status(200).json({ success: true, results: updatedMenu });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
export const deleteMenu = async (req, res, next) => {
  const menu = await menuModel.findById(req.params.id);
  if (!menu || menu.isDeleted) {
    return res
      .status(404)
      .json({ success: false, message: "Menu item not found." });
  }

  if (menu.image?.public_id) {
    await cloudinary.uploader.destroy(menu.image.public_id);
  }

  menu.isDeleted = true;
  await menu.save();

  return res
    .status(200)
    .json({ success: true, message: "Menu item deleted successfully." });
};
