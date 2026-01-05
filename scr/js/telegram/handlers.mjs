import { TelegramClient } from "telegram";

async function handler(event) {
    const message = event.message;

    // Игнорируем пустые сообщения или сервисные уведомления
    if (!message.text) return;

    console.log(`Получено сообщение: ${message.text} из чата ${message.chatId}`);
    
    // Пример ответа (как юзер-бот)
    if (message.text === "Привет") {
        return {
            answer_text:"Привет! Я работаю через MTProto."

        }
    }
}

