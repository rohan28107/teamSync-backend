import mongoose, { Document, Schema } from "mongoose";
import { ProviderEnumType } from "../enums/account-provider.enum";

export interface AccountDocument extends Document {
  provider: ProviderEnumType;
  providerId: string; // Store the email, googleId, facebookId as the providerId
  userId: mongoose.Types.ObjectId;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  createdAt: Date;
}