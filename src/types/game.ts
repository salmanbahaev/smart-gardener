import { Types } from 'mongoose';

// Типы для растений
export interface Plant {
  _id?: Types.ObjectId;
  plantId: Types.ObjectId;
  virtualLevel: number;
  lastAction: Date;
  achievements: Types.ObjectId[];
  name: string;
  type: string;
  health: number;
  lastWatered: Date;
  lastFertilized: Date;
  lastPruned: Date;
}

// Типы для сада
export interface Garden {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  plants: Plant[];
  currency: number;
  totalLevel: number;
  createdAt: Date;
  updatedAt: Date;
  averageLevel?: number;
}

// Типы для достижений
export interface AchievementCriteria {
  type: 'daily_login' | 'plant_care' | 'analysis_count' | 'challenge_completion' | 'level_reach' | 'currency_earn';
  params: {
    count?: number;
    days?: number;
    level?: number;
    currency?: number;
    actionType?: 'water' | 'fertilize' | 'prune';
    challengeCode?: string;
  };
}

export interface Achievement {
  _id?: Types.ObjectId;
  code: string;
  title: string;
  description: string;
  iconUrl: string;
  criteria: AchievementCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    currency: number;
    experience: number;
  };
  isActive: boolean;
  createdAt: Date;
}

// Типы для челленджей
export interface ChallengeRequirement {
  action: 'water' | 'fertilize' | 'prune' | 'analyze' | 'login' | 'level_up';
  count: number;
  description: string;
}

export interface Challenge {
  _id?: Types.ObjectId;
  code: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  requirements: ChallengeRequirement[];
  reward: {
    currency: number;
    experience: number;
    achievement?: Types.ObjectId;
  };
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  createdAt: Date;
  isCurrentlyActive?: boolean;
  timeRemaining?: number;
}

// Типы для прогресса пользователя в челленджах
export interface ChallengeProgress {
  action: string;
  currentCount: number;
  requiredCount: number;
  completed: boolean;
}

export interface UserChallenge {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  progress: ChallengeProgress[];
  isCompleted: boolean;
  completedAt?: Date;
  joinedAt: Date;
  rewardClaimed: boolean;
  overallProgress?: number;
}

// Типы для API запросов
export interface GardenActionRequest {
  plantId: string;
  actionType: 'water' | 'fertilize' | 'prune';
}

export interface GardenActionResponse {
  success: boolean;
  plant?: Plant;
  currency: number;
  newAchievements?: Achievement[];
  message?: string;
}

export interface ChallengeParticipationRequest {
  challengeId: string;
}

export interface ChallengeParticipationResponse {
  success: boolean;
  message?: string;
  challenge?: Challenge;
}

// Типы для игровых действий
export type PlantActionType = 'water' | 'fertilize' | 'prune';

export interface PlantAction {
  type: PlantActionType;
  plantId: string;
  timestamp: Date;
  experienceGained: number;
  currencyGained: number;
} 