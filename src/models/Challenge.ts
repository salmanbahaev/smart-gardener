import mongoose, { Schema, models } from "mongoose";

const RequirementSchema = new Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['water', 'fertilize', 'prune', 'analyze', 'login', 'level_up']
  },
  count: { type: Number, required: true, min: 1 },
  description: { type: String, required: true }
});

const ChallengeSchema = new Schema({
  code: { type: String, required: true, unique: true }, // например, "ORCHID_30_DAYS"
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  requirements: [RequirementSchema],
  reward: {
    currency: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    achievement: { type: Schema.Types.ObjectId, ref: 'Achievement' }
  },
  maxParticipants: { type: Number, default: -1 }, // -1 = безлимит
  currentParticipants: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  category: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'special'],
    default: 'daily'
  },
  createdAt: { type: Date, default: Date.now }
});

// Виртуальное поле для проверки активности челленджа
ChallengeSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Виртуальное поле для оставшегося времени
ChallengeSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (now > this.endDate) return 0;
  return this.endDate.getTime() - now.getTime();
});

export const Challenge = models.Challenge || mongoose.model("Challenge", ChallengeSchema); 