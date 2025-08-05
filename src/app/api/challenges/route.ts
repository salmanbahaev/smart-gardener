import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Challenge } from '@/models/Challenge';
import { UserChallenge } from '@/models/UserChallenge';
import { User } from '@/models/User';
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

    // Получаем активные челленджи
    const now = new Date();
    const activeChallenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ endDate: 1 });

    // Получаем прогресс пользователя в челленджах
    const userChallenges = await UserChallenge.find({ userId: user._id });
    const userChallengeMap = new Map();
    userChallenges.forEach(uc => {
      userChallengeMap.set(uc.challengeId.toString(), uc);
    });

    // Формируем список челленджей с прогрессом
    const challengesWithProgress = activeChallenges.map(challenge => {
      const userChallenge = userChallengeMap.get(challenge._id.toString());
      
      return {
        _id: challenge._id.toString(),
        code: challenge.code,
        title: challenge.title,
        description: challenge.description,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        requirements: challenge.requirements,
        reward: challenge.reward,
        difficulty: challenge.difficulty,
        category: challenge.category,
        currentParticipants: challenge.currentParticipants,
        maxParticipants: challenge.maxParticipants,
        isCurrentlyActive: challenge.isCurrentlyActive,
        timeRemaining: challenge.timeRemaining,
        userProgress: userChallenge ? {
          isParticipating: true,
          isCompleted: userChallenge.isCompleted,
          overallProgress: userChallenge.overallProgress,
          progress: userChallenge.progress,
          joinedAt: userChallenge.joinedAt,
          completedAt: userChallenge.completedAt,
          rewardClaimed: userChallenge.rewardClaimed
        } : {
          isParticipating: false,
          isCompleted: false,
          overallProgress: 0,
          progress: [],
          joinedAt: null,
          completedAt: null,
          rewardClaimed: false
        }
      };
    });

    return NextResponse.json({
      success: true,
      challenges: challengesWithProgress,
      totalActive: activeChallenges.length,
      userParticipating: userChallenges.length
    });

  } catch (error) {
    console.error('Error loading challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 