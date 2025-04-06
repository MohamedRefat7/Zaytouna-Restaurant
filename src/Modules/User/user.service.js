import * as dbService from "../../DB/dbService.js";
import { UserModel } from "../../DB/Models/user.model.js";

export const getProfile = async (req, res, next) => {
  console.log(req);
  const user = await dbService.findOne({
    model: UserModel,
    filter: { _id: req.user._id },
    options: { select: "+phoneNumberRaw" },
  });

  return res.status(200).json({
    success: true,
    user: {
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumberRaw,
    },
  });
};

//admin can access this route
export const getAllProfiles = async (req, res, next) => {
  const isAdmin = req.user.role === "Admin"; // Check if requester is an admin

  const users = isAdmin
    ? await UserModel.find({}).select("+phoneNumberRaw -password") // Admins see `phoneNumberRaw`
    : await UserModel.find({}).select("-password"); // Non-admins don't see `phoneNumberRaw`

  return res.status(200).json({
    success: true,
    users,
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    Object.assign(user, req.body); // Update fields dynamically
    await user.save(); // Hashing will be triggered

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  const user = await dbService.findByIdAndDelete({
    model: UserModel,
    id: req.user._id,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Profile Deleted Successfully",
  });
};
