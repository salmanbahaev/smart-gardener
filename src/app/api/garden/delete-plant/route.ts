import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models';
import { Garden, User } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function DELETE(request: NextRequest) {
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
    const { plantId } = await request.json();
    
    if (!plantId) {
      return NextResponse.json({ error: 'Plant ID is required' }, { status: 400 });
    }

    // Находим сад пользователя
    const garden = await Garden.findOne({ userId: user._id });
    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Находим растение для удаления
    const plantIndex = garden.plants.findIndex((p: { plantId: Types.ObjectId }) => 
      p.plantId.toString() === plantId
    );
    
    if (plantIndex === -1) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    // Удаляем растение
    const removedPlant = garden.plants[plantIndex];
    garden.plants.splice(plantIndex, 1);

    // Пересчитываем общий уровень
    const totalLevel = garden.plants.length > 0 
      ? garden.plants.reduce((sum: number, plant: any) => sum + plant.virtualLevel, 0)
      : 0;

    garden.totalLevel = totalLevel;

    await garden.save();

    return NextResponse.json({
      success: true,
      message: `Растение "${removedPlant.name}" успешно удалено`,
      totalLevel,
      plantsCount: garden.plants.length
    });

  } catch (error) {
    console.error('Error deleting plant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



