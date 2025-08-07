// Типы для API responses

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GardenResponse {
  success: boolean;
  garden: {
    _id: string;
    userId: string;
    plants: Array<{
      _id: string;
      plantId: string;
      virtualLevel: number;
      name: string;
      type: string;
      health: number;
      lastWatered: Date;
      lastFertilized: Date;
      lastPruned: Date;
      achievements: string[];
    }>;
    currency: number;
    totalLevel: number;
    averageLevel: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface AchievementResponse {
  success: boolean;
  achievements: Array<{
    _id: string;
    code: string;
    title: string;
    description: string;
    iconUrl: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    reward: {
      currency: number;
      experience: number;
    };
    isUnlocked: boolean;
    unlockedAt?: Date;
  }>;
  totalAchievements: number;
  unlockedAchievements: number;
}

export interface ChallengeResponse {
  success: boolean;
  challenges: Array<{
    _id: string;
    code: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    requirements: Array<{
      action: string;
      count: number;
      description: string;
    }>;
    reward: {
      currency: number;
      experience: number;
    };
    difficulty: string;
    category: string;
    currentParticipants: number;
    maxParticipants: number;
    isCurrentlyActive: boolean;
    timeRemaining: number;
    userProgress: {
      isParticipating: boolean;
      isCompleted: boolean;
      overallProgress: number;
      progress: Array<{
        action: string;
        currentCount: number;
        requiredCount: number;
        completed: boolean;
      }>;
      joinedAt?: Date;
      completedAt?: Date;
      rewardClaimed: boolean;
    };
  }>;
  totalActive: number;
  userParticipating: number;
} 