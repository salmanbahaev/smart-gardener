import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models';
import { Challenge } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const testChallenges = [
      {
        code: 'DAILY_WATER',
        title: 'Ежедневный полив',
        description: 'Поливайте растения каждый день в течение недели',
        startDate: now,
        endDate: nextWeek,
        requirements: [
          {
            action: 'water',
            count: 7,
            description: 'Полить растения 7 раз'
          }
        ],
        reward: {
          currency: 30,
          experience: 60
        },
        difficulty: 'easy',
        category: 'daily',
        isActive: true
      },
      {
        code: 'FERTILIZER_WEEK',
        title: 'Неделя удобрений',
        description: 'Подкармливайте растения всю неделю',
        startDate: now,
        endDate: nextWeek,
        requirements: [
          {
            action: 'fertilize',
            count: 5,
            description: 'Подкормить растения 5 раз'
          }
        ],
        reward: {
          currency: 40,
          experience: 80
        },
        difficulty: 'medium',
        category: 'weekly',
        isActive: true
      },
      {
        code: 'COMPLETE_CARE',
        title: 'Полный уход',
        description: 'Выполните все виды ухода за растениями',
        startDate: now,
        endDate: nextWeek,
        requirements: [
          {
            action: 'water',
            count: 3,
            description: 'Полить растения 3 раза'
          },
          {
            action: 'fertilize',
            count: 2,
            description: 'Подкормить растения 2 раза'
          },
          {
            action: 'prune',
            count: 1,
            description: 'Обрезать растения 1 раз'
          }
        ],
        reward: {
          currency: 60,
          experience: 120
        },
        difficulty: 'hard',
        category: 'weekly',
        isActive: true
      },
      {
        code: 'ANALYSIS_MASTER',
        title: 'Мастер анализа',
        description: 'Проанализируйте 5 растений за неделю',
        startDate: now,
        endDate: nextWeek,
        requirements: [
          {
            action: 'analyze',
            count: 5,
            description: 'Проанализировать 5 растений'
          }
        ],
        reward: {
          currency: 50,
          experience: 100
        },
        difficulty: 'medium',
        category: 'weekly',
        isActive: true
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const challengeData of testChallenges) {
      const existing = await Challenge.findOne({ code: challengeData.code });
      if (existing) {
        // Обновляем существующий челлендж
        await Challenge.updateOne(
          { code: challengeData.code },
          { 
            ...challengeData,
            updatedAt: new Date()
          }
        );
        updatedCount++;
      } else {
        // Создаем новый челлендж
        await Challenge.create(challengeData);
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Челленджи успешно загружены: ${createdCount} создано, ${updatedCount} обновлено`,
      total: testChallenges.length
    });

  } catch (error) {
    console.error('Error seeding challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





