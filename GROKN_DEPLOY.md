# Деплой на grokn.io

Базовая настройка и интеграция с n8n.

---

## 1. Подготовка репозитория

- В корне уже есть **`start.mjs`** — единая точка входа (API + бот).
- В **package.json** скрипт: `"start": "node start.mjs"`.
- Порт берётся из **`process.env.PORT`** (grokn.io подставит свой).

Дополнительно в **package.json** можно указать Node (если grokn поддерживает):

```json
"engines": {
  "node": ">=18"
}
```

---

## 2. Настройка в grokn.io

### Build / Start

- **Build command:** оставь пустым или `npm install`.
- **Start command:** `node start.mjs` или `npm start`.
- **Root directory:** корень репозитория (где `package.json` и `start.mjs`).

### Переменные окружения (Environment Variables)

В панели проекта добавь:

| Переменная      | Описание |
|-----------------|----------|
| `PORT`          | Обычно задаёт сам grokn.io, дублировать не нужно. |
| `BOT_TOKEN`     | Токен бота от @BotFather. |
| `MONGO_URI`     | Строка подключения MongoDB (бот и пользователи). |
| `ID_TELEGRAM`   | API ID с [my.telegram.org](https://my.telegram.org) (для MTProto / поиск каналов). |
| `API_HASH`      | API Hash с my.telegram.org. |
| `OWNER_ID`      | Твой Telegram user ID (опционально). |

Для **поиска каналов** (n8n) и MTProto нужны `ID_TELEGRAM` и `API_HASH`. Сессию GramJS на grokn лучше хранить в переменной (см. ниже).

---

## 3. URL приложения

После деплоя grokn.io выдаст URL, например:

- `https://твой-проект.grokn.io`  
или  
- `https://xxx.grokn.io`

Это твой **базовый URL**. Без слэша в конце.

---

## 4. Интеграция с n8n

В воркфлоу n8n в узлах **HTTP Request** замени `YOUR_SERVER_URL` на этот URL.

Примеры:

- `https://твой-проект.grokn.io/api/n8n/set-waiting-keyword`
- `https://твой-проект.grokn.io/api/n8n/check-waiting-keyword`
- `https://твой-проект.grokn.io/api/n8n/clear-waiting-keyword`
- `https://твой-проект.grokn.io/api/n8n/search-channels`

Проверка в браузере:

`https://твой-проект.grokn.io/api/n8n/check-waiting-keyword?chatId=1`

Ожидаемый ответ: `{"waiting":false}`.

---

## 5. Сессия Telegram (MTProto) на grokn.io

На сервере файловая система часто временная, файл `session.txt` может пропадать после рестарта.

Варианты:

1. **Переменная окружения**  
   Добавить в grokn.io переменную `TELEGRAM_SESSION_STRING` и в коде читать сессию из неё вместо файла (потребуется правка `scr/js/api/n8n-search-channels.mjs` и/или `main.mjs`).
2. **Внешнее хранилище**  
   Хранить сессию в БД или защищённом хранилище и при старте записывать в файл или в память.

Пока можно деплоить как есть; поиск каналов будет работать до первого рестарта контейнера, если сессия только в файле.

---

## 6. Чек-лист

- [ ] Репозиторий подключён к grokn.io  
- [ ] Start command: `node start.mjs` (или `npm start`)  
- [ ] Заданы `BOT_TOKEN`, `MONGO_URI`, `ID_TELEGRAM`, `API_HASH`  
- [ ] В n8n во всех HTTP Request подставлен URL приложения grokn.io  
- [ ] Проверен запрос к `/api/n8n/check-waiting-keyword?chatId=1`
