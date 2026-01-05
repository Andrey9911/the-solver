const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

import { handler } from './handlers.mjs';
import dotenv from 'dotenv';

// ❗ вставь свои данные
dotenv.config();          // API ID
const apiId = process.env.ID_TELEGRAM
const apiHash = process.env.API_CASH;
const stringSession = new StringSession(""); // можно вставить сохранённый session

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

(async () => {
  console.log("Запуск клиента...");

  await client.start({
    phoneNumber: async () => await input.text("Введите номер телефона: "),
    password: async () => await input.text("Введите 2FA пароль: "),
    phoneCode: async () => await input.text("Введите код из Telegram: "),
    onError: err => console.log(err),
  });

  console.log("Авторизация успешна!");
  console.log("Ваша session string:");
  console.log(client.session.save()); // сохрани — чтобы не логиниться снова

  // пример: отправка сообщения
  await client.sendMessage("me", { message: "Работает MTProto на Node.js!" });
})();

//проверка обновлений по mtproto
client.addEventHandler(handler, new NewMessage({
    incoming: true
}));