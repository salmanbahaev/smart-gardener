import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
// @ts-ignore
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false,
  },
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const SYSTEM_PROMPT = `Ты — эксперт-садовод, специализирующийся на диагностике состояния растений, включая комнатные растения, садовые культуры и деревья. Отвечай на вопросы пользователя по анализу растений, давай советы, уточняй детали, если нужно. Пиши на русском языке, дружелюбно, понятно и коротко без воды.`;

async function parseForm(req: NextApiRequest) {
  return new Promise<{ filePath: string; history: any[] }>((resolve, reject) => {
    const form = formidable({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
    });
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      const audioFile = files.audio;
      const history = JSON.parse(fields.history as string);
      if (!audioFile) return reject(new Error("Нет аудиофайла"));
      const fileObj = Array.isArray(audioFile) ? audioFile[0] : audioFile;
      if (!fileObj.filepath) return reject(new Error("Нет пути к файлу"));
      resolve({ filePath: fileObj.filepath, history });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { filePath, history } = await parseForm(req);
    console.log('Путь к аудиофайлу:', filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error('Файл не найден: ' + filePath);
    }
    // Генерируем уникальное имя для файла
    const fileName = `voice_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.webm`;
    const destPath = path.join(process.cwd(), 'public', 'voice-messages', fileName);
    // Копируем файл в public/voice-messages
    fs.copyFileSync(filePath, destPath);
    const audioUrl = `/voice-messages/${fileName}`;
    // 1. Распознаём речь через Whisper
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: 'ru',
    });
    const userText = transcript.text;
    // 2. Добавляем в историю
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
        .filter((msg: any) => typeof msg.content === 'string' && msg.content)
        .map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userText },
    ];
    // 3. Получаем ответ от OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.3,
    });
    const answer = completion.choices[0]?.message?.content || 'Нет ответа';

    // 4. Генерируем аудиофайл для ответа бота через OpenAI TTS
    const botFileName = `bot_voice_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.mp3`;
    const botDestPath = path.join(process.cwd(), 'public', 'voice-messages', botFileName);
    const ttsResponse = await openai.audio.speech.create({
      model: 'tts-1',
      input: answer,
      voice: 'onyx',
    });
    const buffer = Buffer.from(await ttsResponse.arrayBuffer());
    fs.writeFileSync(botDestPath, buffer);
    const botAudioUrl = `/voice-messages/${botFileName}`;

    // 5. Возвращаем только ссылку на аудиофайл ответа бота
    res.status(200).json({ audioUrl: botAudioUrl });
  } catch (e) {
    console.error('Ошибка в /api/chat-voice:', e);
    res.status(500).json({ error: 'Ошибка голосового чата', details: e instanceof Error ? e.message : String(e) });
  }
} 