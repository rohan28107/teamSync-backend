import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../utils/appError";
import { config } from "../config/app.config";

const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { _id: string };
    console.log("decoded JWT payload:", decoded);
    (req as any).user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedException("Invalid token");
  }
};

export default jwtAuthMiddleware;