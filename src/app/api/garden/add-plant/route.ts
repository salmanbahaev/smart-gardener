import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models';
import { Garden, User } from '@/lib/models';
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
    const { name, type } = await request.json();
    
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Находим сад пользователя
    let garden = await Garden.findOne({ userId: user._id });
    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Создаем новое растение
    const now = new Date();
    const newPlant = {
      plantId: new Types.ObjectId(),
      virtualLevel: 1,
      name: name.trim(),
      type: type.trim(),
      health: 100,
      lastWatered: now,
      lastFertilized: now,
      lastPruned: now,
      lastAction: now,
      achievements: []
    };

    // Добавляем растение в сад
    garden.plants.push(newPlant);

    // Пересчитываем общий уровень
    const totalLevel = garden.plants.reduce((sum: number, plant: any) => sum + plant.virtualLevel, 0);
    garden.totalLevel = totalLevel;

    await garden.save();

    return NextResponse.json({
      success: true,
      message: `Растение "${name}" успешно добавлено в сад`,
      plant: {
        ...newPlant,
        _id: newPlant.plantId.toString(),
        plantId: newPlant.plantId.toString()
      },
      totalLevel,
      plantsCount: garden.plants.length
    });

  } catch (error) {
    console.error('Error adding plant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



