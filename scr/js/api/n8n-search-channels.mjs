/**
 * API для n8n workflow "Поиск каналов по ключевому слову"
 * Использует MTProto (GramJS) для contacts.Search
 *
 * Добавь в serverTest.mjs:
 *   import { n8nSearchRoutes } from './scr/js/api/n8n-search-channels.mjs';
 *   app.use(express.json());
 *   app.use('/api/n8n', n8nSearchRoutes);
 */

import 'dotenv/config';
import { Router } from 'express';
import { createRequire } from 'module';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Вызов invoke через внутренний модуль GramJS (на случай если client.invoke не привязан)
const { invoke: rawInvoke } = require('telegram/client/users');

// In-memory store для ожидания ключевого слова (для production лучше Redis)
const waitingForKeyword = new Map();

let telegramClient = null;

async function getClient() {
  if (telegramClient) return telegramClient;
  const apiId = Number(process.env.ID_TELEGRAM);
  const apiHash = process.env.API_HASH;
  const sessionPath = path.join(__dirname, '../../../session.txt');
  let sessionString = '';
  if (fs.existsSync(sessionPath)) {
    sessionString = fs.readFileSync(sessionPath, 'utf8');
  }
  telegramClient = new TelegramClient(
    new StringSession(sessionString),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );
  await telegramClient.connect();
  return telegramClient;
}

export function setTelegramClient(client) {
  telegramClient = client;
}

/**
 * Поиск каналов/чатов по ключевому слову через contacts.Search
 * @param {string} keyword
 * @param {number} limit
 */
export async function searchChannelsByKeyword(keyword, limit = 20) {
  if (!keyword || keyword.trim().length < 2) {
    return { error: 'Ключевое слово должно быть не короче 2 символов.' };
  }

  try {
    const client = await getClient();
    const request = new Api.contacts.Search({
      q: keyword.trim(),
      limit: Math.min(limit, 50)
    });
    // Используем client.invoke если есть, иначе вызов через внутренний rawInvoke (GramJS)
    const result = typeof client.invoke === 'function'
      ? await client.invoke(request)
      : await rawInvoke(client, request);

    const channels = [];
    if (result.chats) {
      for (const chat of result.chats) {
        if (chat.broadcast || chat.megagroup) {
          channels.push({
            id: chat.id?.toString(),
            title: chat.title || 'Без названия',
            username: chat.username || null
          });
        }
      }
    }
    if (result.users) {
      for (const user of result.users) {
        if (user.username) {
          channels.push({
            id: user.id?.toString(),
            title: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
            username: user.username
          });
        }
      }
    }

    return { channels };
  } catch (err) {
    console.error('[searchChannels]', err);
    return {
      error: err.message || 'Ошибка поиска каналов'
    };
  }
}

const router = Router();

// POST /api/n8n/set-waiting-keyword — сохранить, что чат ждёт ключевое слово
router.post('/set-waiting-keyword', (req, res) => {
  const { chatId, userId } = req.body || {};
  if (!chatId) {
    return res.status(400).json({ error: 'chatId обязателен' });
  }
  waitingForKeyword.set(String(chatId), { userId, at: Date.now() });
  res.json({ ok: true });
});

// GET /api/n8n/check-waiting-keyword?chatId= — проверить, ждёт ли чат ключ
router.get('/check-waiting-keyword', (req, res) => {
  const chatId = req.query.chatId;
  if (!chatId) {
    return res.status(400).json({ waiting: false });
  }
  const has = waitingForKeyword.has(String(chatId));
  res.json({ waiting: !!has });
});

// POST /api/n8n/clear-waiting-keyword — сбросить ожидание
router.post('/clear-waiting-keyword', (req, res) => {
  const { chatId } = req.body || {};
  if (chatId) {
    waitingForKeyword.delete(String(chatId));
  }
  res.json({ ok: true });
});

// POST /api/n8n/search-channels — поиск каналов (вызывается из n8n)
router.post('/search-channels', async (req, res) => {
  const { keyword, limit = 20 } = req.body || {};
  const result = await searchChannelsByKeyword(keyword, limit);
  res.json(result);
});

export const n8nSearchRoutes = router;
