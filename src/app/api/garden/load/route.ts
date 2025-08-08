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

    // Ищем или создаем сад для пользователя
    let garden = await Garden.findOne({ userId: user._id }).populate('plants.achievements');
    
    if (!garden) {
      const now = new Date();
      // Создаем новый сад с базовыми растениями
      garden = new Garden({
        userId: user._id,
        plants: [
          {
            plantId: new (await import('mongoose')).Types.ObjectId(),
            virtualLevel: 1,
            name: "Орхидея",
            type: "orchid",
            health: 100,
            lastWatered: now,
            lastFertilized: now,
            lastPruned: now,
            lastAction: now
          },
          {
            plantId: new (await import('mongoose')).Types.ObjectId(),
            virtualLevel: 1,
            name: "Кактус",
            type: "cactus",
            health: 100,
            lastWatered: now,
            lastFertilized: now,
            lastPruned: now,
            lastAction: now
          }
        ],
        currency: 50, // Начальная валюта
        totalLevel: 2
      });
      await garden.save();
    }

    // Вычисляем средний уровень растений
    const averageLevel = garden.plants.length > 0 
      ? Math.round((garden.plants as Array<{ virtualLevel: number }>).reduce((sum, plant) => sum + plant.virtualLevel, 0) / garden.plants.length)
      : 0;

    return NextResponse.json({
      success: true,
      garden: {
        ...garden.toObject(),
        averageLevel,
        plants: (garden.plants as Array<any>).map((plant: any) => ({
          ...plant.toObject(),
          _id: plant._id.toString(),
          plantId: plant.plantId.toString(),
          lastWatered: plant.lastWatered.toISOString(),
          lastFertilized: plant.lastFertilized.toISOString(),
          lastPruned: plant.lastPruned.toISOString(),
          lastAction: plant.lastAction.toISOString()
        }))
      }
    });

  } catch (error) {
    console.error('Error loading garden:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 