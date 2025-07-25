import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import jwtAuthMiddleware from "./middlewares/jwtAuth.middleware";
import projectRoutes from "./routes/project.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    // config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// app.use(
//   session({
//     name: "session",
//     keys: [config.SESSION_SECRET],
//     maxAge: 24 * 60 * 60 * 1000,
//     secure: config.NODE_ENV === "production",
//     httpOnly: true,
//     sameSite: "lax",
//   })
// );
// app.use(
//   session({
//     name: "session",
//     keys: [config.SESSION_SECRET],
//     maxAge: 24 * 60 * 60 * 1000,
//     secure: true, // ✅ Send only over HTTPS
//     httpOnly: true,
//     sameSite: "none", // ✅ Allow cross-site cookies
//   })
// );
app.use(
  session({
    name: "session",
    secret: config.SESSION_SECRET,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only true when using HTTPS
    sameSite: "none", // allow cross-origin cookie usage
  })
);


app.use(passport.initialize());
// app.use(passport.session());

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
    // throw new BadRequestException(
    //   "this is bad request",
    //   ErrorCodeEnum.AUTH_INVALID_TOKEN
    // );
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Everyone",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, jwtAuthMiddleware, userRoutes);
app.use(`${BASE_PATH}/workspace`, jwtAuthMiddleware, workspaceRoutes);
app.use(`${BASE_PATH}/member`, jwtAuthMiddleware, memberRoutes);
app.use(`${BASE_PATH}/project`, jwtAuthMiddleware, projectRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
