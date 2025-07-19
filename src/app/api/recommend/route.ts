import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OpenAI } from "openai";

const JWT_SECRET = process.env.JWT_SECRET as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Нет токена" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
  }

  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Нет URL изображения" }, { status: 400 });
  }

  // Промпт для GPT-4 (или 3.5)
  const prompt = `Ты — помощник садовода. На фото по ссылке: ${imageUrl} изображено растение. Определи вид растения (если возможно), оцени его состояние (здоровье, влажность, болезни, пожелтение листьев) и дай рекомендации по уходу: полив, подкормка, пересадка, освещение. Ответь на русском языке, структурировано.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // можно заменить на gpt-3.5-turbo для экономии
      messages: [
        { role: "system", content: "Ты — эксперт по растениям и помощник садовода." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    const text = completion.choices[0]?.message?.content || "Нет ответа";
    return NextResponse.json({ recommendations: text });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка OpenAI" }, { status: 500 });
  }
} 