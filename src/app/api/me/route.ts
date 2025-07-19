import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Нет токена" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    return NextResponse.json({ email: payload.email });
  } catch {
    return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
  }
} 