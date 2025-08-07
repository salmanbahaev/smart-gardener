import mongoose, { Schema, models, Document } from "mongoose";
import { IUserChallenge } from "@/types/models";

const ProgressSchema = new Schema({
  action: { type: String, required: true },
  currentCount: { type: Number, default: 0 },
  requiredCount: { type: Number, required: true },
  completed: { type: Boolean, default: false }
});

const UserChallengeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  progress: [ProgressSchema],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  joinedAt: { type: Date, default: Date.now },
  rewardClaimed: { type: Boolean, default: false }
});

// Составной индекс для уникальности участия пользователя в челлендже
UserChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// Виртуальное поле для общего прогресса
UserChallengeSchema.virtual('overallProgress').get(function() {
  if (!this.progress || this.progress.length === 0) return 0;
  const completed = this.progress.filter(p => p.completed).length;
  return Math.round((completed / this.progress.length) * 100);
});

export const UserChallenge = models.UserChallenge || mongoose.model<IUserChallenge & Document>("UserChallenge", UserChallengeSchema); 