import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middleware/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // throw new Error("test error");
    // const user = await UserModel.findOne({
    //   email: email
    // })
    // if(!user){
    //   return res.status.apply(404).json({
    //     message: "Hello Err"
    //   })
    // }
    throw new BadRequestException("this is bad request", ErrorCodeEnum.AUTH_INVALID_TOKEN);
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Everyone",
    });
  })
);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
