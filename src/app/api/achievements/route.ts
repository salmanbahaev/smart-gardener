import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Garden } from '@/models/Garden';
import { User } from '@/models/User';
import { Achievement } from '@/models/Achievement';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/[...nextauth]';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Находим пользователя
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем сад пользователя с достижениями
    const garden = await Garden.findOne({ userId: user._id }).populate('plants.achievements');
    
    if (!garden) {
      return NextResponse.json({ 
        success: true, 
        achievements: [],
        totalAchievements: 0,
        unlockedAchievements: 0
      });
    }

    // Получаем все достижения
    const allAchievements = await Achievement.find({ isActive: true }).sort({ rarity: 1, createdAt: 1 });
    
    // Собираем все ID достижений пользователя
    const userAchievementIds = new Set();
    garden.plants.forEach((plant: any) => {
      plant.achievements.forEach((achievement: any) => {
        userAchievementIds.add(achievement._id.toString());
      });
    });

    // Формируем список достижений с информацией о разблокировке
    const achievementsWithStatus = allAchievements.map(achievement => ({
      _id: achievement._id.toString(),
      code: achievement.code,
      title: achievement.title,
      description: achievement.description,
      iconUrl: achievement.iconUrl,
      rarity: achievement.rarity,
      reward: achievement.reward,
      isUnlocked: userAchievementIds.has(achievement._id.toString()),
      unlockedAt: userAchievementIds.has(achievement._id.toString()) ? new Date() : null
    }));

    return NextResponse.json({
      success: true,
      achievements: achievementsWithStatus,
      totalAchievements: allAchievements.length,
      unlockedAchievements: userAchievementIds.size
    });

  } catch (error) {
    console.error('Error loading achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 