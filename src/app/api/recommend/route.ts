import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OpenAI } from "openai";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { imageUrl, comment } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Нет URL изображения" }, { status: 400 });
  }

  // Новый лаконичный промпт для GPT
  const prompt = `Ты — эксперт-садовод. Кратко оцени состояние растения по фото и комментарию пользователя, дай только самые важные рекомендации. Если не хватает данных, попроси пользователя уточнить детали. Пиши на русском, по делу, без воды.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // можно заменить на gpt-3.5-turbo для экономии
      messages: [
        { role: "system", content: "Ты — эксперт по растениям и помощник садовода." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content || "Нет ответа";

    // Сохраняем анализ в профиль пользователя
    try {
      await connectToDatabase();
      const payload = jwt.verify(token, JWT_SECRET) as { email: string };
      const user = await User.findOne({ email: payload.email });
      if (user) {
        user.analyses = user.analyses || [];
        user.analyses.push({ imageUrl, result: text, createdAt: new Date() });
        user.analysisCount = (user.analysisCount || 0) + 1;
        await user.save();
      }
    } catch (e) {
      console.error('Ошибка сохранения анализа:', e);
    }

    return NextResponse.json({ recommendations: text });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка OpenAI" }, { status: 500 });
  }
} 