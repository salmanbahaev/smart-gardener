import mongoose, { Schema, models, Document } from "mongoose";
import { IAchievement } from "@/types/models";

const CriteriaSchema = new Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['daily_login', 'plant_care', 'analysis_count', 'challenge_completion', 'level_reach', 'currency_earn']
  },
  params: {
    count: { type: Number, default: 1 },
    days: { type: Number, default: 1 },
    level: { type: Number, default: 1 },
    currency: { type: Number, default: 0 },
    actionType: { type: String, enum: ['water', 'fertilize', 'prune'] },
    challengeCode: { type: String }
  }
});

const AchievementSchema = new Schema({
  code: { type: String, required: true, unique: true }, // например, "DAILY_LOGIN_7"
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconUrl: { type: String, required: true },
  criteria: { type: CriteriaSchema, required: true },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  reward: {
    currency: { type: Number, default: 0 },
    experience: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Achievement = models.Achievement || mongoose.model<IAchievement & Document>("Achievement", AchievementSchema); 