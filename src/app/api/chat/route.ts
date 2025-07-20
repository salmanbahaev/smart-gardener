import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const SYSTEM_PROMPT = `Ты — эксперт-садовод, специализирующийся на диагностике состояния растений, включая комнатные растения, садовые культуры и деревья. Отвечай на вопросы пользователя по анализу растений, давай советы, уточняй детали, если нужно. Пиши на русском языке, дружелюбно, понятно и коротко без воды.`;

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json(); // [{role: 'user'|'assistant', content: string}]
    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: "Нет истории диалога" }, { status: 400 });
    }
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content || "Нет ответа";
    return NextResponse.json({ answer: text });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка OpenAI" }, { status: 500 });
  }
} 