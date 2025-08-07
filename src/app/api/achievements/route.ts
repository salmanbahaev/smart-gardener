import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models'; // Инициализируем все модели
import { Garden, User, Achievement } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Проверяем JWT токен
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'JWT_SECRET not configured' }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Находим пользователя
    const user = await User.findById(decoded.userId);
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