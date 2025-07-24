import UserModel from "../models/user.model";
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");
  console.log('user', userId, user);
  if (!user) {
    throw new BadRequestException("User not found");
  }

  return {
    user,
  };
};