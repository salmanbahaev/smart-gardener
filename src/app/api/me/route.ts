import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import '@/lib/models'; // Инициализируем все модели
import { User } from "@/lib/models";

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
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    // Возвращаем только нужные поля, analyses — только 10 последних
    const allAnalyses = user.analyses || [];
    const lastAnalyses = allAnalyses.slice(-10).reverse();
    return NextResponse.json({
      email: user.email,
      name: user.name || "",
      phone: user.phone || "",
      telegram: user.telegram || "",
      siteType: user.siteType || 'garden',
      avatar: user.avatar || "",
      createdAt: user.createdAt,
      analysisCount: user.analysisCount || 0,
      analyses: lastAnalyses,
      achievements: user.achievements || [],
      location: user.location || null,
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

export async function PUT(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    const body = await req.json();
    await connectToDatabase();
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    // Обновляем разрешённые поля
    if (typeof body.name === 'string') user.name = body.name.slice(0, 80);
    if (typeof body.phone === 'string') user.phone = body.phone.slice(0, 40);
    if (typeof body.telegram === 'string') user.telegram = body.telegram.slice(0, 80);
    if (typeof body.siteType === 'string' && ['garden','pot'].includes(body.siteType)) user.siteType = body.siteType;
    if (body.location && typeof body.location === 'object') {
      user.location = user.location || {} as any;
      if (typeof body.location.cityName === 'string') user.location.cityName = body.location.cityName.slice(0, 120);
      if (typeof body.location.lat === 'number') user.location.lat = body.location.lat;
      if (typeof body.location.lon === 'number') user.location.lon = body.location.lon;
      if (typeof body.location.timeZone === 'string') user.location.timeZone = body.location.timeZone.slice(0, 60);
    }
    await user.save();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка обновления профиля" }, { status: 500 });
  }
}