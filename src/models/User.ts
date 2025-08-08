import mongoose, { Schema, models, Document } from "mongoose";
import { IUser } from "@/types/models";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: "" },
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  telegram: { type: String, default: "" },
  siteType: { type: String, default: "garden", enum: ["garden", "pot"] },
  createdAt: { type: Date, default: Date.now },
  analysisCount: { type: Number, default: 0 },
  analyses: [{
    imageUrl: String,
    result: String,
    createdAt: { type: Date, default: Date.now }
  }],
  achievements: [{
    code: String, // например, "first_analysis"
    label: String, // например, "Первый анализ"
    icon: String, // emoji или url
    achievedAt: Date
  }],
  location: {
    cityName: { type: String, default: "" },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    timeZone: { type: String, default: "" }
  }
});

export const User = models.User || mongoose.model<IUser & Document>("User", UserSchema); 