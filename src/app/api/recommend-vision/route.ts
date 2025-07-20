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
    return NextResponse.json({ error: "Нет токена" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const comment = formData.get("comment")?.toString() || "";
  if (!file) {
    return NextResponse.json({ error: "Нет файла" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  // Упрощённый промпт без комментария
  const visionPrompt = "На фото растение. Кратко оцени вид, состояние и дай рекомендации по уходу. Строго на русском языке.";
  const systemPrompt = "Ты — эксперт по растениям. Всегда отвечай только на русском языке. Если не можешь распознать растение, дай общие советы по уходу.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content || "Нет ответа";

    // Сохраняем анализ в профиль пользователя
    const imageUrl = formData.get('imageUrl')?.toString() || '';
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
    console.error("OpenAI Vision error:", e);
    return NextResponse.json({ error: "Ошибка OpenAI Vision", details: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
} 