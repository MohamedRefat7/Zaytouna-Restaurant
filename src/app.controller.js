import authRouter from "./Modules/Auth/auth.controller.js";
import menuRouter from "./Modules/Menu/menu.controller.js";
import orderRouter from "./Modules/Orders/order.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import adminRouter from "./Modules/Admin/admin.controller.js";
import categoryRouter from "./Modules/Category/category.controller.js";
import subCategoryRouter from "./Modules/subCategory/subCategory.controller.js";
import cartRouter from "./Modules/Cart/cart.controller.js";
import checkOutRouter from "./Modules/CheckOut/checkOut.controller.js";

import morgan from "morgan";
import connectDB from "./DB/connection.js";
import {
  globalErrorHandler,
  notFoundHabdler,
} from "./utils/error handling/asyncHandler.js";
import cors from "cors";

const bootstarp = async (app, express) => {
  let corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
  await connectDB();

  app.use(morgan("dev"));
  app.use(express.json());

  app.get("/", (req, res) => res.json("Hello From Zaytouna Restaurant😊❤!"));

  app.use("/auth", authRouter);
  app.use("/menu", menuRouter);
  app.use("/orders", orderRouter);
  app.use("/user", userRouter);
  app.use("/admin", adminRouter);
  app.use("/category", categoryRouter);
  app.use("/subCategory", subCategoryRouter);
  app.use("/cart", cartRouter);
  app.use("/checkOut", checkOutRouter);

  app.all("*", notFoundHabdler);

  app.use(globalErrorHandler);
};

export default bootstarp;
