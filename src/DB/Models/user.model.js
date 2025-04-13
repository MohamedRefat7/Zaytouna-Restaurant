import mongoose, { Schema, Types, model } from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

export const genderType = {
  male: "male",
  female: "female",
};
export const roleType = {
  superSuperAdmin: "superSuperAdmin",
  superAdmin: "superAdmin",
  Admin: "Admin",
  User: "User",
};

export const providersTypes = {
  Google: "Google",
  System: "System",
};

export const defaultProfilePicture = "Uploads/defaultProfileImage.jpg";

export const secureUrl =
  "https://res.cloudinary.com/daezne9v3/image/upload/v1737837513/asdasuiewghs__defaultProfilePicture_pjggmy.jpg";

export const publicId = "asdasuiewghs__defaultProfilePicture_pjggmy";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minLength: [3, "userName must be at least 3 characters"],
      maxLength: [30, "userName must be at most 20 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    phoneNumber: String,
    phoneNumberRaw: {
      type: String, // Store actual phone number for admin
      select: true, // Hide it by default
    },
    // address: String,
    // DOB: Date,
    image: {
      public_id: {
        type: String,
        default: publicId,
      },
      secure_url: {
        type: String,
        default: secureUrl,
      },
    },
    // coverImages: [
    //   {
    //     public_id: String,
    //     secure_url: String,
    //   },
    // ],
    // gender: {
    //   type: String,
    //   enum: Object.values(genderType),
    //   default: genderType.male,
    // },
    role: {
      type: String,
      enum: Object.values(roleType),
      default: roleType.User,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    providersType: {
      type: String,
      enum: Object.values(providersTypes),
      default: providersTypes.System,
    },
    changedCredentialsTime: Date,
    confirmEmailOTP: String,
    forgetPasswordOTP: String,

    // viewers: [
    //   {
    //     userId: { type: Types.ObjectId, ref: "User" },
    //     time: Date,
    //   },
    // ],
    // address: [
    //   {
    //     city: String,
    //     postelCode: String,
    //     country: String,
    //   },
    // ],
    tempEmail: String,
    tempEmailOtp: String,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  // hash password
  if (this.isModified("password"))
    this.password = hash({ plainText: this.password });
  if (this.isModified("phoneNumber")) {
    this.phoneNumberRaw = this.phoneNumber; // Store actual phone number for admin
    this.phoneNumber = hash({ plainText: this.phoneNumber });
  }
  return next();
});

userSchema.pre("findOneAndUpdate", function (next) {
  // hash password
  if (this._update.password)
    this._update.password = hash({ plainText: this._update.password });
  if (this._update.phoneNumber) {
    this._update.phoneNumberRaw = this._update.phoneNumber; // Store actual phone number for admin
    this._update.phoneNumber = hash({ plainText: this._update.phoneNumber });
  }
  return next();
});

userSchema.query.paginate = async function (page) {
  page = page ? page : 1;
  const limit = 3;
  const skip = (page - 1) * limit;
  //data , currentpage, totalpages, totalitems, itemsperpage, nextpage, prevpage
  const data = await this.skip(skip).limit(limit);
  const users = await this.clone().countDocuments();

  return {
    data,
    currentPage: Number(page),
    totalPages: Math.ceil(users / limit),
    totalusers: users,
    usersPerPage: data.length,
    nextPage: Number(page) + 1,
    prevPage: page - 1,
  };
};

userSchema.query.search = function (keyword) {
  if (keyword) {
    return this.find({
      $or: [
        { userName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword, $options: "i" } },
      ],
    });
  }
  return this;
};

export const UserModel = mongoose.model.User || model("User", userSchema);
