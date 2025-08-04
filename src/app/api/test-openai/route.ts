import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

export async function GET(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ 
      error: "OPENAI_API_KEY не настроен в переменных окружения" 
    }, { status: 500 });
  }

  const openai = new OpenAI({ 
    apiKey: OPENAI_API_KEY,
    timeout: 30000,
  });

  try {
    // Простой тест подключения
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Ответь 'OK' если ты работаешь" }
      ],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content;
    
    return NextResponse.json({ 
      success: true, 
      message: "OpenAI API работает корректно",
      response: response 
    });
  } catch (error: any) {
    console.error("OpenAI test error:", error);
    
    let errorMessage = "Неизвестная ошибка";
    let statusCode = 500;

    if (error.status === 401) {
      errorMessage = "Неверный API ключ OpenAI";
      statusCode = 401;
    } else if (error.status === 429) {
      errorMessage = "Превышен лимит запросов к OpenAI";
      statusCode = 429;
    } else if (error.code === 'ECONNRESET' || error.message?.includes('fetch failed')) {
      errorMessage = "Проблема с сетевым подключением";
    } else if (error.message?.includes('timeout')) {
      errorMessage = "Превышено время ожидания";
    }

    return NextResponse.json({ 
      error: errorMessage, 
      details: error.message,
      status: error.status,
      code: error.code
    }, { status: statusCode });
  }
} 