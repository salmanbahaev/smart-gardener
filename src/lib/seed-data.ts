import { connectToDatabase } from './db';
import { Achievement } from '@/models/Achievement';
import { Challenge } from '@/models/Challenge';

export async function seedAchievements() {
  await connectToDatabase();
  
  const achievements = [
    {
      code: 'FIRST_WATER',
      title: 'Первый полив',
      description: 'Полили растение впервые',
      iconUrl: '💧',
      criteria: {
        type: 'plant_care',
        params: {
          actionType: 'water',
          count: 1
        }
      },
      rarity: 'common',
      reward: {
        currency: 5,
        experience: 10
      }
    },
    {
      code: 'WATER_MASTER',
      title: 'Мастер полива',
      description: 'Полили растения 10 раз',
      iconUrl: '🌊',
      criteria: {
        type: 'plant_care',
        params: {
          actionType: 'water',
          count: 10
        }
      },
      rarity: 'rare',
      reward: {
        currency: 20,
        experience: 50
      }
    },
    {
      code: 'FERTILIZER_EXPERT',
      title: 'Эксперт по удобрениям',
      description: 'Подкормили растения 5 раз',
      iconUrl: '🌱',
      criteria: {
        type: 'plant_care',
        params: {
          actionType: 'fertilize',
          count: 5
        }
      },
      rarity: 'rare',
      reward: {
        currency: 15,
        experience: 30
      }
    },
    {
      code: 'LEVEL_10',
      title: 'Растущий садовод',
      description: 'Достигли 10 уровня с растением',
      iconUrl: '⭐',
      criteria: {
        type: 'level_reach',
        params: {
          level: 10
        }
      },
      rarity: 'epic',
      reward: {
        currency: 50,
        experience: 100
      }
    },
    {
      code: 'CURRENCY_100',
      title: 'Богатый садовод',
      description: 'Накопили 100 листочков',
      iconUrl: '🍃',
      criteria: {
        type: 'currency_earn',
        params: {
          currency: 100
        }
      },
      rarity: 'epic',
      reward: {
        currency: 25,
        experience: 75
      }
    }
  ];

  for (const achievement of achievements) {
    const existing = await Achievement.findOne({ code: achievement.code });
    if (!existing) {
      await Achievement.create(achievement);
      console.log(`Created achievement: ${achievement.title}`);
    }
  }
}

export async function seedChallenges() {
  await connectToDatabase();
  
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const challenges = [
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
      category: 'daily'
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
      category: 'weekly'
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
      category: 'weekly'
    }
  ];

  for (const challenge of challenges) {
    const existing = await Challenge.findOne({ code: challenge.code });
    if (!existing) {
      await Challenge.create(challenge);
      console.log(`Created challenge: ${challenge.title}`);
    }
  }
}

export async function seedAll() {
  console.log('Seeding achievements...');
  await seedAchievements();
  
  console.log('Seeding challenges...');
  await seedChallenges();
  
  console.log('Seeding completed!');
} 