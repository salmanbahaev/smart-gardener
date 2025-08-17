# SmartGardener

SmartGardener — это Next.js-приложение для распознавания растений по фото, получения рекомендаций по уходу и ведения персонального журнала садовода.

## Возможности

- Регистрация и вход по email
- Загрузка фото растения (Cloudinary)
- Получение рекомендаций по уходу (OpenAI)
- Персональный профиль и журнал
- Виртуальный сад с геймификацией
- Система достижений и челленджей
- Защита роутов (только для авторизованных)
- Удобная навигация и современный UI

## Быстрый старт

1. Клонируйте репозиторий и установите зависимости:

   ```bash
   npm install
   # или
   yarn install
   ```

2. Создайте файл `.env.local` на основе `.env.example` и заполните своими ключами:

   ```bash
   cp .env.example .env.local
   # затем отредактируйте .env.local
   ```

3. Запустите локальный сервер:

   ```bash
   npm run dev
   # или
   yarn dev
   ```

4. Откройте [http://localhost:3000](http://localhost:3000)

## 🚀 Развертывание на Vercel (Продакшен)

### Шаг 1: Подготовка

1. Убедитесь, что все изменения закоммичены в Git
2. Создайте аккаунт на [vercel.com](https://vercel.com)

### Шаг 2: Настройка базы данных

1. Создайте бесплатный кластер MongoDB Atlas
2. Получите строку подключения (MONGODB_URI)

### Шаг 3: Развертывание

1. **Через Vercel Dashboard:**

   - Зайдите на [vercel.com/dashboard](https://vercel.com/dashboard)
   - Нажмите "New Project"
   - Подключите ваш GitHub репозиторий
   - Настройте переменные окружения (см. ниже)

2. **Через Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

### Шаг 4: Переменные окружения

В Vercel Dashboard добавьте следующие переменные:

| Переменная              | Описание                     | Пример                                                       |
| ----------------------- | ---------------------------- | ------------------------------------------------------------ |
| `MONGODB_URI`           | Строка подключения к MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/smart-gardener` |
| `JWT_SECRET`            | Секретный ключ для JWT       | `your-super-secret-jwt-key-here`                             |
| `OPENAI_API_KEY`        | API ключ OpenAI              | `sk-...`                                                     |
| `CLOUDINARY_CLOUD_NAME` | Имя облака Cloudinary        | `your-cloud-name`                                            |
| `CLOUDINARY_API_KEY`    | API ключ Cloudinary          | `123456789`                                                  |
| `CLOUDINARY_API_SECRET` | API секрет Cloudinary        | `your-secret-key`                                            |

### Шаг 5: Домен

- Vercel автоматически даст вам домен вида: `your-project.vercel.app`
- Можно подключить свой домен в настройках проекта

## Структура проекта

- `src/app` — страницы и API-роуты
- `src/components` — переиспользуемые компоненты (Loader, Toast и др.)
- `src/lib` — вспомогательные библиотеки (например, db)
- `src/models` — модели данных (User и др.)

## Переменные окружения

Все необходимые переменные описаны в `.env.example`.

## Лицензия

MIT
