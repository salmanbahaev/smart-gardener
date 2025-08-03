import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    await connectToDatabase();
    const user = await User.findOne({ email: payload.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    // Возвращаем только нужные поля, analyses — только 10 последних
    const allAnalyses = user.analyses || [];
    const lastAnalyses = allAnalyses.slice(-10).reverse();
    return NextResponse.json({
      email: user.email,
      avatar: user.avatar || "",
      createdAt: user.createdAt,
      analysisCount: user.analysisCount || 0,
      analyses: lastAnalyses,
      achievements: user.achievements || [],
      hasMoreAnalyses: allAnalyses.length > 10,
    });
  } catch {
    return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    await connectToDatabase();
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    const { index } = await req.json();
    if (typeof index !== 'number' || index < 0 || index >= (user.analyses?.length || 0)) {
      return NextResponse.json({ error: "Некорректный индекс" }, { status: 400 });
    }
    user.analyses.splice(index, 1);
    user.analysisCount = Math.max(0, (user.analysisCount || 1) - 1);
    await user.save();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка удаления анализа" }, { status: 500 });
  }
} 