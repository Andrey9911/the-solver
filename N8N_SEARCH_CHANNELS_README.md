# Интеграция: Поиск каналов по ключевому слову (getPostsOtherChannel-other)

## Как подключить

### 1. Импорт workflow в n8n

1. В n8n: **Workflows** → **Import from File** → выбери `n8n-workflow-search-channels.json`
2. Либо скопируй JSON и вставь через **Import from URL** / **Import from JSON**

### 2. Подключение к твоему Switch1

В своём основном workflow:

- **Switch1, output 4** (5-е правило — `startsWith getPostsOtherChannel`) → **Спросить ключевое слово**
- **Switch1, fallback** (когда ни одно правило не сработало, например при обычном сообщении) → **Есть текст сообщения?**

Важно: если в Switch1 нет выхода для обычных сообщений, добавь правило:
- `leftValue`: `={{ $json.message?.text }}`
- `operator`: not empty  
- Выход этого правила → **Есть текст сообщения?**

### 3. Настройка URL сервера

Замени `https://YOUR_SERVER_URL` на реальный адрес твоего backend во всех HTTP Request узлах:

- `Сохранить ожидание ключа`
- `Проверить ожидание`
- `Сбросить ожидание`
- `MTProto: поиск каналов`

**Локально:** `http://localhost:3333`  
**Railway:** `https://ТВОЙ-ПРОЕКТ.up.railway.app`  
**grokn.io:** `https://ТВОЙ-ПРОЕКТ.grokn.io` (или URL из панели grokn)  
Везде — без слэша в конце.

### 4. API на сервере

В `serverTest.mjs` добавь:

```javascript
import express from 'express';
import { n8nSearchRoutes } from './scr/js/api/n8n-search-channels.mjs';

const app = express();
app.use(express.json());  // обязательно для POST с JSON

// ... существующие роуты ...

app.use('/api/n8n', n8nSearchRoutes);

app.listen(3333, () => { ... });
```

### 5. Переменные окружения

В `.env` нужны:
- `ID_TELEGRAM` — API ID из my.telegram.org
- `API_HASH` — API Hash
- Файл `session.txt` в корне проекта (та же сессия GramJS, что и у бота)

## Логика работы

1. Пользователь нажимает «другое» → callback `getPostsOtherChannel-other`
2. Бот отправляет: «Введи ключевое слово для поиска каналов»
3. В API сохраняется состояние ожидания по `chatId`
4. Пользователь вводит слово
5. n8n получает новое обновление, проверяет ожидание
6. Вызывается MTProto `contacts.Search`, результаты отправляются пользователю

## Endpoints API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/n8n/set-waiting-keyword` | Сохранить ожидание (chatId, userId) |
| GET  | `/api/n8n/check-waiting-keyword?chatId=` | Проверить ожидание |
| POST | `/api/n8n/clear-waiting-keyword` | Сбросить ожидание |
| POST | `/api/n8n/search-channels` | Поиск каналов (keyword, limit) |
