import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import '@/lib/models'; // Инициализируем все модели
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
  }
  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Пользователь уже существует" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  return NextResponse.json({ message: "Пользователь зарегистрирован", userId: user._id });
} 