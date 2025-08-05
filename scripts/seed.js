const mongoose = require("mongoose");

// Подключение к базе данных
async function connectToDatabase() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/smart-gardener";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Схемы для создания данных
const AchievementSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconUrl: { type: String, required: true },
  criteria: {
    type: { type: String, required: true },
    params: {
      count: { type: Number, default: 1 },
      days: { type: Number, default: 1 },
      level: { type: Number, default: 1 },
      currency: { type: Number, default: 0 },
      actionType: { type: String },
      challengeCode: { type: String },
    },
  },
  rarity: { type: String, default: "common" },
  reward: {
    currency: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const ChallengeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  requirements: [
    {
      action: { type: String, required: true },
      count: { type: Number, required: true },
      description: { type: String, required: true },
    },
  ],
  reward: {
    currency: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    achievement: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
  },
  maxParticipants: { type: Number, default: -1 },
  currentParticipants: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  difficulty: { type: String, default: "medium" },
  category: { type: String, default: "daily" },
  createdAt: { type: Date, default: Date.now },
});

const Achievement =
  mongoose.models.Achievement ||
  mongoose.model("Achievement", AchievementSchema);
const Challenge =
  mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);

async function seedAchievements() {
  const achievements = [
    {
      code: "FIRST_WATER",
      title: "Первый полив",
      description: "Полили растение впервые",
      iconUrl: "💧",
      criteria: {
        type: "plant_care",
        params: {
          actionType: "water",
          count: 1,
        },
      },
      rarity: "common",
      reward: {
        currency: 5,
        experience: 10,
      },
    },
    {
      code: "WATER_MASTER",
      title: "Мастер полива",
      description: "Полили растения 10 раз",
      iconUrl: "🌊",
      criteria: {
        type: "plant_care",
        params: {
          actionType: "water",
          count: 10,
        },
      },
      rarity: "rare",
      reward: {
        currency: 20,
        experience: 50,
      },
    },
    {
      code: "FERTILIZER_EXPERT",
      title: "Эксперт по удобрениям",
      description: "Подкормили растения 5 раз",
      iconUrl: "🌱",
      criteria: {
        type: "plant_care",
        params: {
          actionType: "fertilize",
          count: 5,
        },
      },
      rarity: "rare",
      reward: {
        currency: 15,
        experience: 30,
      },
    },
    {
      code: "LEVEL_10",
      title: "Растущий садовод",
      description: "Достигли 10 уровня с растением",
      iconUrl: "⭐",
      criteria: {
        type: "level_reach",
        params: {
          level: 10,
        },
      },
      rarity: "epic",
      reward: {
        currency: 50,
        experience: 100,
      },
    },
    {
      code: "CURRENCY_100",
      title: "Богатый садовод",
      description: "Накопили 100 листочков",
      iconUrl: "🍃",
      criteria: {
        type: "currency_earn",
        params: {
          currency: 100,
        },
      },
      rarity: "epic",
      reward: {
        currency: 25,
        experience: 75,
      },
    },
  ];

  for (const achievement of achievements) {
    const existing = await Achievement.findOne({ code: achievement.code });
    if (!existing) {
      await Achievement.create(achievement);
      console.log(`Created achievement: ${achievement.title}`);
    }
  }
}

async function seedChallenges() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const challenges = [
    {
      code: "DAILY_WATER",
      title: "Ежедневный полив",
      description: "Поливайте растения каждый день в течение недели",
      startDate: now,
      endDate: nextWeek,
      requirements: [
        {
          action: "water",
          count: 7,
          description: "Полить растения 7 раз",
        },
      ],
      reward: {
        currency: 30,
        experience: 60,
      },
      difficulty: "easy",
      category: "daily",
    },
    {
      code: "FERTILIZER_WEEK",
      title: "Неделя удобрений",
      description: "Подкармливайте растения всю неделю",
      startDate: now,
      endDate: nextWeek,
      requirements: [
        {
          action: "fertilize",
          count: 5,
          description: "Подкормить растения 5 раз",
        },
      ],
      reward: {
        currency: 40,
        experience: 80,
      },
      difficulty: "medium",
      category: "weekly",
    },
    {
      code: "COMPLETE_CARE",
      title: "Полный уход",
      description: "Выполните все виды ухода за растениями",
      startDate: now,
      endDate: nextWeek,
      requirements: [
        {
          action: "water",
          count: 3,
          description: "Полить растения 3 раза",
        },
        {
          action: "fertilize",
          count: 2,
          description: "Подкормить растения 2 раза",
        },
        {
          action: "prune",
          count: 1,
          description: "Обрезать растения 1 раз",
        },
      ],
      reward: {
        currency: 60,
        experience: 120,
      },
      difficulty: "hard",
      category: "weekly",
    },
  ];

  for (const challenge of challenges) {
    const existing = await Challenge.findOne({ code: challenge.code });
    if (!existing) {
      await Challenge.create(challenge);
      console.log(`Created challenge: ${challenge.title}`);
    }
  }
}

async function seedAll() {
  try {
    await connectToDatabase();

    console.log("Seeding achievements...");
    await seedAchievements();

    console.log("Seeding challenges...");
    await seedChallenges();

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedAll();
