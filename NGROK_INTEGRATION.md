# Интеграция с ngrok (облачная конечная точка)

Твой домен: **https://sportsmanly-gracelessly-lashell.ngrok-free.dev**

---

## 1. Запуск проекта и туннеля

**Терминал 1 — приложение:**
```bash
node start.mjs
```
Сервер слушает порт **3333**.

**Терминал 2 — ngrok с твоим доменом:**

Если при запуске `ngrok` в PowerShell появляется ошибка *«выполнение сценариев отключено»*, используй один из вариантов:

- **Через npx (без смены политики):**
  ```bash
  npx ngrok http 3333 --domain=sportsmanly-gracelessly-lashell.ngrok-free.dev
  ```

- **Разрешить скрипты в PowerShell (один раз):**
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
  После этого команда `ngrok http ...` будет работать.

Обычный запуск ngrok:
```bash
ngrok http 3333 --domain=sportsmanly-gracelessly-lashell.ngrok-free.dev
```

После запуска запросы на `https://sportsmanly-gracelessly-lashell.ngrok-free.dev` будут проксироваться на `localhost:3333`.

---

## 2. n8n: подставить URL

В воркфлоу n8n в **каждом** узле **HTTP Request** в поле URL используй:

**Базовый URL (без слэша в конце):**  
`https://sportsmanly-gracelessly-lashell.ngrok-free.dev`

Полные URL для узлов:

| Узел | URL |
|------|-----|
| Сохранить ожидание ключа | `https://sportsmanly-gracelessly-lashell.ngrok-free.dev/api/n8n/set-waiting-keyword` |
| Проверить ожидание | `https://sportsmanly-gracelessly-lashell.ngrok-free.dev/api/n8n/check-waiting-keyword` |
| Сбросить ожидание | `https://sportsmanly-gracelessly-lashell.ngrok-free.dev/api/n8n/clear-waiting-keyword` |
| MTProto: поиск каналов | `https://sportsmanly-gracelessly-lashell.ngrok-free.dev/api/n8n/search-channels` |

В импортированном `n8n-workflow-search-channels.json` этот URL уже подставлен — достаточно импортировать и подключить к Switch.

---

## 3. Обход страницы «Visit Site» (опционально)

Если n8n получает HTML-страницу ngrok вместо JSON, добавь в HTTP Request заголовок:

- **Name:** `ngrok-skip-browser-warning`  
- **Value:** `true`

Тогда ngrok не будет показывать предупреждение для программных запросов.

---

## 4. Проверка

В браузере открой:
```
https://sportsmanly-gracelessly-lashell.ngrok-free.dev/api/n8n/check-waiting-keyword?chatId=1
```
Ожидаемый ответ: `{"waiting":false}`.

---

## Важно

- Туннель работает, пока запущена команда `ngrok http 3333 --domain=...`.
- С бесплатным облачным доменом URL постоянный — менять в n8n не нужно.
- Для доступа из интернета (n8n в облаке и т.п.) сначала запусти проект и ngrok на своём ПК.
