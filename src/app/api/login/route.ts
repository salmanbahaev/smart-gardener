import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import '@/lib/models'; // Инициализируем все модели
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
  }
  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  if (!JWT_SECRET) {
    return NextResponse.json({ error: "JWT_SECRET не задан" }, { status: 500 });
  }
  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return NextResponse.json({ token });
} 