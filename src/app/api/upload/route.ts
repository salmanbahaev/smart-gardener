import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET as string;

// export const runtime = "edge";

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
  if (!file) {
    return NextResponse.json({ error: "Нет файла" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "plants" }, (err, result) => {
        if (err || !result) reject(err);
        else resolve(result);
      }).end(buffer);
    });
    return NextResponse.json({ url: upload.secure_url });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
} 