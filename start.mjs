/**
 * Единая точка входа: запуск всего проекта
 * - Express API (порт 3333 или process.env.PORT)
 * - Telegram-бот (Grammy + MTProto из main.mjs)
 *
 * Запуск: node start.mjs
 */

// 1. Поднимаем Express (статичка, /api/n8n, веб)
import './serverTest.mjs';

// 2. Подключаем и запускаем бота (БД, Grammy, n8n и т.д.)
await import('./botTelegram.mjs');
