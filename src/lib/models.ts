// Инициализация всех моделей Mongoose
// Этот файл должен быть импортирован в начале каждого API route

import '../models/User';
import '../models/Garden';
import '../models/Achievement';
import '../models/Challenge';
import '../models/UserChallenge';

// Экспортируем модели для удобства
export { User } from '../models/User';
export { Garden } from '../models/Garden';
export { Achievement } from '../models/Achievement';
export { Challenge } from '../models/Challenge';
export { UserChallenge } from '../models/UserChallenge'; 