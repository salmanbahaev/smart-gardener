import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import '@/lib/models';
import { User, Garden } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET as string;

type OpenMeteoHourly = {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
  wind_speed_10m: number[];
};

type OpenMeteoResponse = {
  hourly: OpenMeteoHourly;
};

async function fetchWeather(lat: number, lon: number): Promise<OpenMeteoResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_speed_10m&forecast_days=2&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API error');
  return res.json() as Promise<OpenMeteoResponse>;
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { email?: string, userId?: string };

    await connectToDatabase();
    const user = payload.email
      ? await User.findOne({ email: payload.email })
      : await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    if (!user.location?.lat || !user.location?.lon) {
      return NextResponse.json({ error: 'Не задана локация пользователя' }, { status: 400 });
    }

    const garden = await Garden.findOne({ userId: user._id });
    const plants = garden?.plants || [];

    const weather = await fetchWeather(user.location.lat, user.location.lon);
    const hourly = weather.hourly;
    const now = Date.now();

    // Индексы ближайших 12 часов, начиная от текущего времени
    const nextIndices: number[] = [];
    for (let i = 0; i < hourly.time.length && nextIndices.length < 12; i++) {
      const t = Date.parse(hourly.time[i]);
      if (!Number.isNaN(t) && t >= now) nextIndices.push(i);
    }
    if (nextIndices.length === 0) {
      return NextResponse.json({ error: 'Нет данных прогноза' }, { status: 502 });
    }

    const rainSum = nextIndices.reduce((sum, idx) => sum + (hourly.precipitation[idx] ?? 0), 0);
    const tempMax = Math.max(...nextIndices.map(idx => hourly.temperature_2m[idx] ?? -Infinity));
    const windMax = Math.max(...nextIndices.map(idx => hourly.wind_speed_10m[idx] ?? 0));

    // История (упрощенно): последние действия, чтобы учитывать интервалы
    // В реальном ввиде смотреть plants[].history, если доступно

    const actions: Array<{ title: string; reason: string; action: string }> = [];
    if (rainSum >= 5) {
      actions.push({ title: 'Полив не требуется', reason: 'Ожидается существенный дождь в ближайшие 12 часов', action: 'skip_water' });
    } else if (tempMax >= 28 || windMax >= 10) {
      actions.push({ title: 'Лёгкий полив утром', reason: 'Жара/ветер ускоряют испарение', action: 'water_light' });
    } else {
      actions.push({ title: 'Обычный полив по графику', reason: 'Нет дождя и экстремальных условий', action: 'water_normal' });
    }

    // Защита от заморозков: ближайшая ночь (час 3:00 местного времени)
    const nextNightIdx = hourly.time.findIndex(t => {
      const d = new Date(t);
      return d.getTime() >= now && d.getHours() === 3;
    });
    if (nextNightIdx >= 0 && (hourly.temperature_2m[nextNightIdx] ?? 99) <= 3) {
      actions.unshift({ title: 'Укрыть растения вечером', reason: 'Ожидаются заморозки ночью', action: 'cover' });
    }

    return NextResponse.json({
      success: true,
      location: user.location,
      plantsCount: plants.length,
      forecastSummary: {
        rainNext12hMm: Math.round(rainSum * 10) / 10,
        tempMaxNext12h: tempMax,
        windMaxNext12h: windMax,
      },
      recommendations: actions,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось получить рекомендации погоды' }, { status: 500 });
  }
}

