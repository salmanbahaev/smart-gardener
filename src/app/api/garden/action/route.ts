import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Garden } from '@/models/Garden';
import { User } from '@/models/User';
import { Achievement } from '@/models/Achievement';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
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

    // Получаем данные запроса
    const { plantId, actionType } = await request.json();
    
    if (!plantId || !actionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Находим сад пользователя
    const garden = await Garden.findOne({ userId: user._id });
    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Находим растение
    const plant = garden.plants.find(p => p.plantId.toString() === plantId);
    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // Проверяем время последнего действия (не чаще чем раз в час)
    const now = new Date();
    const lastActionTime = new Date(plant.lastAction);
    const timeDiff = now.getTime() - lastActionTime.getTime();
    const oneHour = 60 * 60 * 1000;

    if (timeDiff < oneHour) {
      return NextResponse.json({ 
        error: 'Action too frequent. Please wait before next action.',
        timeRemaining: Math.ceil((oneHour - timeDiff) / (60 * 1000))
      }, { status: 429 });
    }

    // Выполняем действие
    let experienceGained = 0;
    let currencyGained = 0;
    let levelUp = false;

    switch (actionType) {
      case 'water':
        plant.health = Math.min(100, plant.health + 10);
        plant.lastWatered = now;
        experienceGained = 5;
        currencyGained = 2;
        break;
      case 'fertilize':
        plant.health = Math.min(100, plant.health + 15);
        plant.lastFertilized = now;
        experienceGained = 8;
        currencyGained = 3;
        break;
      case 'prune':
        plant.health = Math.min(100, plant.health + 5);
        plant.lastPruned = now;
        experienceGained = 3;
        currencyGained = 1;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Обновляем растение
    plant.lastAction = now;
    plant.virtualLevel += experienceGained;
    
    // Проверяем повышение уровня
    if (plant.virtualLevel >= 100) {
      plant.virtualLevel = 100;
      levelUp = true;
    }

    // Обновляем валюту
    garden.currency += currencyGained;

    // Проверяем достижения
    const newAchievements = await checkAchievements(user._id, actionType, garden);

    await garden.save();

    return NextResponse.json({
      success: true,
      plant: {
        ...plant.toObject(),
        _id: plant._id.toString(),
        plantId: plant.plantId.toString()
      },
      currency: garden.currency,
      experienceGained,
      currencyGained,
      levelUp,
      newAchievements
    });

  } catch (error) {
    console.error('Error performing garden action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Функция проверки достижений
async function checkAchievements(userId: Types.ObjectId, actionType: string, garden: any) {
  const newAchievements = [];
  
  // Получаем все активные достижения
  const achievements = await Achievement.find({ isActive: true });
  
  for (const achievement of achievements) {
    // Проверяем, не получено ли уже это достижение
    const hasAchievement = garden.plants.some((plant: any) => 
      plant.achievements.includes(achievement._id)
    );
    
    if (hasAchievement) continue;

    // Проверяем критерии достижения
    let shouldAward = false;
    
    switch (achievement.criteria.type) {
      case 'plant_care':
        if (achievement.criteria.params.actionType === actionType) {
          // Подсчитываем количество действий данного типа
          const actionCount = garden.plants.reduce((count: number, plant: any) => {
            // Простая логика подсчета - можно улучшить
            return count + (plant.virtualLevel > 1 ? 1 : 0);
          }, 0);
          
          if (actionCount >= (achievement.criteria.params.count || 1)) {
            shouldAward = true;
          }
        }
        break;
        
      case 'level_reach':
        const maxLevel = Math.max(...garden.plants.map((plant: any) => plant.virtualLevel));
        if (maxLevel >= (achievement.criteria.params.level || 1)) {
          shouldAward = true;
        }
        break;
        
      case 'currency_earn':
        if (garden.currency >= (achievement.criteria.params.currency || 0)) {
          shouldAward = true;
        }
        break;
    }
    
    if (shouldAward) {
      // Добавляем достижение к первому растению (можно улучшить логику)
      if (garden.plants.length > 0) {
        garden.plants[0].achievements.push(achievement._id);
      }
      
      newAchievements.push({
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        rarity: achievement.rarity
      });
    }
  }
  
  return newAchievements;
} 