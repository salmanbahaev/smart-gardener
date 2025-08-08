import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models'; // Инициализируем все модели
import { Challenge, UserChallenge, User } from '@/lib/models';
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
    const { challengeId } = await request.json();
    
    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    // Находим челлендж
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Проверяем, активен ли челлендж
    const now = new Date();
    if (!challenge.isActive || now < challenge.startDate || now > challenge.endDate) {
      return NextResponse.json({ error: 'Challenge is not active' }, { status: 400 });
    }

    // Проверяем, не участвует ли уже пользователь
    const existingParticipation = await UserChallenge.findOne({
      userId: user._id,
      challengeId: challenge._id
    });

    if (existingParticipation) {
      return NextResponse.json({ error: 'Already participating in this challenge' }, { status: 400 });
    }

    // Проверяем лимит участников
    if (challenge.maxParticipants > 0 && challenge.currentParticipants >= challenge.maxParticipants) {
      return NextResponse.json({ error: 'Challenge is full' }, { status: 400 });
    }

    // Создаем прогресс для пользователя
    const progress = challenge.requirements.map((req: { action: string; count: number }) => ({
      action: req.action,
      currentCount: 0,
      requiredCount: req.count,
      completed: false
    }));

    const userChallenge = new UserChallenge({
      userId: user._id,
      challengeId: challenge._id,
      progress,
      isCompleted: false,
      joinedAt: now
    });

    await userChallenge.save();

    // Увеличиваем счетчик участников
    challenge.currentParticipants += 1;
    await challenge.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the challenge',
      challenge: {
        _id: challenge._id.toString(),
        title: challenge.title,
        description: challenge.description,
        endDate: challenge.endDate,
        requirements: challenge.requirements,
        reward: challenge.reward
      },
      userProgress: {
        isParticipating: true,
        isCompleted: false,
        overallProgress: 0,
        progress,
        joinedAt: now
      }
    });

  } catch (error) {
    console.error('Error participating in challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 