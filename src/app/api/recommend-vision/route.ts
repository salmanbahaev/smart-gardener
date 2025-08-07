import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OpenAI } from "openai";
import { connectToDatabase } from "@/lib/db";
import '@/lib/models'; // Инициализируем все модели
import { User } from "@/lib/models";

const JWT_SECRET = process.env.JWT_SECRET as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

// Проверяем наличие API ключа
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY не настроен");
}

const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  // Добавляем таймауты для предотвращения зависания
  timeout: 60000, // 60 секунд
  maxRetries: 3,
});

// Функция для повторных попыток с экспоненциальной задержкой
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Проверяем, стоит ли повторять попытку
      if (error.code === 'ECONNRESET' || 
          error.code === 'ETIMEDOUT' || 
          error.message?.includes('fetch failed') ||
          error.message?.includes('network') ||
          error.status === 429) {
        
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Попытка ${attempt + 1} не удалась, повтор через ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Для других ошибок не повторяем
      throw error;
    }
  }
  throw new Error('Все попытки исчерпаны');
}

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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const comment = formData.get("comment")?.toString() || "";
  if (!file) {
    return NextResponse.json({ error: "Нет файла" }, { status: 400 });
  }

  // Проверяем размер файла
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Файл слишком большой. Максимальный размер: 10MB" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  // Упрощённый промпт без комментария
  const visionPrompt = "На фото растение. Кратко оцени вид, состояние и дай рекомендации по уходу. Строго на русском языке.";
  const systemPrompt = "Ты — эксперт по растениям. Всегда отвечай только на русском языке. Если не можешь распознать растение, дай общие советы по уходу.";

  try {
    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
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
  } catch (e: any) {
    console.error("OpenAI Vision error:", e);
    
    // Более детальная обработка ошибок
    let errorMessage = "Ошибка при анализе изображения";
    let statusCode = 500;

    if (e.code === 'ECONNRESET' || e.message?.includes('fetch failed')) {
      errorMessage = "Проблема с сетевым подключением. Проверьте интернет-соединение.";
    } else if (e.status === 401) {
      errorMessage = "Неверный API ключ OpenAI";
      statusCode = 401;
    } else if (e.status === 429) {
      errorMessage = "Превышен лимит запросов к OpenAI. Попробуйте позже.";
      statusCode = 429;
    } else if (e.status === 400) {
      errorMessage = "Некорректный запрос к OpenAI";
      statusCode = 400;
    } else if (e.message?.includes('timeout')) {
      errorMessage = "Превышено время ожидания ответа от OpenAI";
    }

    return NextResponse.json({ 
      error: errorMessage, 
      details: e instanceof Error ? e.message : String(e) 
    }, { status: statusCode });
  }
} 