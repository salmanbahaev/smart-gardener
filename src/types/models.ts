import { Types } from 'mongoose';

// Типы для моделей Mongoose

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name?: string;
  phone?: string;
  telegram?: string;
  siteType?: 'garden' | 'pot';
  avatar?: string;
  createdAt: Date;
  analysisCount: number;
  analyses: Array<{
    imageUrl: string;
    result: string;
    createdAt: Date;
  }>;
  achievements: Array<{
    code: string;
    label: string;
    icon: string;
    achievedAt: Date;
  }>;
  location?: {
    cityName?: string;
    lat?: number | null;
    lon?: number | null;
    timeZone?: string;
  };
}

export interface IPlant {
  _id: Types.ObjectId;
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

export interface IGarden {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plants: IPlant[];
  currency: number;
  totalLevel: number;
  createdAt: Date;
  updatedAt: Date;
  averageLevel?: number; // Виртуальное поле
}

export interface IAchievementCriteria {
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

export interface IAchievement {
  _id: Types.ObjectId;
  code: string;
  title: string;
  description: string;
  iconUrl: string;
  criteria: IAchievementCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    currency: number;
    experience: number;
  };
  isActive: boolean;
  createdAt: Date;
}

export interface IRequirement {
  action: 'water' | 'fertilize' | 'prune' | 'analyze' | 'login' | 'level_up';
  count: number;
  description: string;
}

export interface IChallenge {
  _id: Types.ObjectId;
  code: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  requirements: IRequirement[];
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
  isCurrentlyActive?: boolean; // Виртуальное поле
  timeRemaining?: number; // Виртуальное поле
}

export interface IProgress {
  action: string;
  currentCount: number;
  requiredCount: number;
  completed: boolean;
}

export interface IUserChallenge {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  progress: IProgress[];
  isCompleted: boolean;
  completedAt?: Date;
  joinedAt: Date;
  rewardClaimed: boolean;
  overallProgress?: number; // Виртуальное поле
} 