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

### Шаг 1: Подготовка проекта

1. **Проверьте Git статус:**

   ```bash
   git status
   git add .
   git commit -m "Подготовка к развертыванию на Vercel"
   git push origin main
   ```

2. **Создайте аккаунт на Vercel:**

   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "Sign Up" в правом верхнем углу
   - Выберите "Continue with GitHub" (рекомендуется)
   - Авторизуйтесь через GitHub
   - Подтвердите email адрес

3. **Убедитесь, что проект готов к продакшену:**
   - Все зависимости установлены: `npm install`
   - Проект собирается: `npm run build`
   - Нет критических ошибок в консоли

### Шаг 2: Настройка базы данных MongoDB Atlas

1. **Создание аккаунта MongoDB Atlas:**

   - Перейдите на [mongodb.com/atlas](https://mongodb.com/atlas)
   - Нажмите "Try Free" или "Get Started Free"
   - Заполните форму регистрации (email, пароль, имя)
   - Выберите "Create a cluster"

2. **Создание кластера:**

   - Выберите план "FREE" (M0 Sandbox)
   - Выберите облачного провайдера (AWS, Google Cloud или Azure)
   - Выберите регион (ближайший к вашим пользователям)
   - Нажмите "Create Cluster"
   - Дождитесь создания кластера (5-10 минут)

3. **Настройка безопасности:**

   - В левом меню найдите "Database Access"
   - Нажмите "Add New Database User"
   - Username: `smartgardener` (или любое другое)
   - Password: создайте сложный пароль
   - User Privileges: выберите "Read and write to any database"
   - Нажмите "Add User"

4. **Настройка сетевого доступа:**

   - В левом меню найдите "Network Access"
   - Нажмите "Add IP Address"
   - Выберите "Allow Access from Anywhere" (0.0.0.0/0)
   - Нажмите "Confirm"

5. **Получение строки подключения:**
   - Вернитесь в "Database" в левом меню
   - Нажмите "Connect" на вашем кластере
   - Выберите "Connect your application"
   - Скопируйте строку подключения
   - Замените `<password>` на пароль пользователя
   - Замените `<dbname>` на `smart-gardener`

### Шаг 3: Развертывание на Vercel

#### Вариант A: Через Vercel Dashboard (Рекомендуется)

1. **Создание нового проекта:**

   - Войдите в [vercel.com/dashboard](https://vercel.com/dashboard)
   - Нажмите большую кнопку "New Project"
   - Выберите "Import Git Repository"
   - Найдите и выберите ваш репозиторий `smart-gardener`
   - Нажмите "Import"

2. **Настройка проекта:**

   - Project Name: `smart-gardener` (или любое другое)
   - Framework Preset: должен автоматически определиться как "Next.js"
   - Root Directory: оставьте пустым (если проект в корне)
   - Build Command: оставьте по умолчанию
   - Output Directory: оставьте по умолчанию
   - Install Command: оставьте по умолчанию

3. **Настройка переменных окружения:**

   - В разделе "Environment Variables" добавьте каждую переменную:

   **MONGODB_URI:**

   - Name: `MONGODB_URI`
   - Value: ваша строка подключения из MongoDB Atlas
   - Environment: Production, Preview, Development (отметьте все три)

   **JWT_SECRET:**

   - Name: `JWT_SECRET`
   - Value: создайте сложный секретный ключ (минимум 32 символа)
   - Environment: Production, Preview, Development

   **OPENAI_API_KEY:**

   - Name: `OPENAI_API_KEY`
   - Value: ваш API ключ OpenAI (начинается с `sk-`)
   - Environment: Production, Preview, Development

   **CLOUDINARY_CLOUD_NAME:**

   - Name: `CLOUDINARY_CLOUD_NAME`
   - Value: имя вашего облака Cloudinary
   - Environment: Production, Preview, Development

   **CLOUDINARY_API_KEY:**

   - Name: `CLOUDINARY_API_KEY`
   - Value: ваш API ключ Cloudinary
   - Environment: Production, Preview, Development

   **CLOUDINARY_API_SECRET:**

   - Name: `CLOUDINARY_API_SECRET`
   - Value: ваш API секрет Cloudinary
   - Environment: Production, Preview, Development

4. **Запуск деплоя:**
   - Нажмите "Deploy"
   - Дождитесь завершения сборки (2-5 минут)
   - При успешном деплое вы увидите "Ready" статус

#### Вариант B: Через Vercel CLI

1. **Установка Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Авторизация:**

   ```bash
   vercel login
   ```

   - Откроется браузер для авторизации
   - Подтвердите доступ к вашему GitHub аккаунту

3. **Развертывание:**

   ```bash
   vercel
   ```

   - Ответьте на вопросы:
     - Set up and deploy: `Y`
     - Which scope: выберите ваш аккаунт
     - Link to existing project: `N`
     - Project name: `smart-gardener`
     - In which directory is your code located: `./` (текущая папка)
     - Want to override the settings: `N`

4. **Настройка переменных окружения:**

   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add OPENAI_API_KEY
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

5. **Финальный деплой:**
   ```bash
   vercel --prod
   ```

### Шаг 4: Проверка развертывания

1. **Проверьте статус деплоя:**

   - В Vercel Dashboard должен быть статус "Ready"
   - Скопируйте URL вашего проекта (например: `https://smart-gardener-xxx.vercel.app`)

2. **Тестирование функционала:**

   - Откройте URL в браузере
   - Попробуйте зарегистрироваться
   - Проверьте основные функции приложения

3. **Проверка логов:**
   - В Vercel Dashboard перейдите в "Functions"
   - Проверьте, что API роуты работают без ошибок

### Шаг 5: Настройка домена

1. **Автоматический домен:**

   - Vercel автоматически даст вам домен вида: `smart-gardener-xxx.vercel.app`
   - Этот домен будет работать сразу после деплоя

2. **Подключение своего домена (опционально):**
   - В настройках проекта перейдите в "Domains"
   - Добавьте ваш домен
   - Настройте DNS записи у вашего регистратора доменов

## Структура проекта

- `src/app` — страницы и API-роуты
- `src/components` — переиспользуемые компоненты (Loader, Toast и др.)
- `src/lib` — вспомогательные библиотеки (например, db)
- `src/models` — модели данных (User и др.)

## Переменные окружения

Все необходимые переменные описаны в `.env.example`.

## Лицензия

MIT
