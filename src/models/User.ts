import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

export const User = models.User || mongoose.model("User", UserSchema); 