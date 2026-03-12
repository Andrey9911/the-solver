import { Api } from "telegram";
import { client,ensureConnected } from "../main.mjs";
// Предполагается, что client (TelegramClient) у тебя уже инициализирован и подключен

export async function getChannelAnalytics360(channelIdentifier) {
    try {
        await ensureConnected();
        console.log(`📊 Запуск сбора аналитики для: ${channelIdentifier}...`);
        
        // 1. Получаем последние 50 постов
        const messages = await client.getMessages(channelIdentifier, { limit: 50 });
        const analyticsData = [];

        for (const msg of messages) {
            // Пропускаем сервисные сообщения (закрепления, изменения фото и т.д.)
            if (msg instanceof Api.MessageService) continue;
            // Пропускаем совсем пустые сообщения
            if (!msg.message && !msg.media) continue;

            // 2. Базовый скелет данных поста
            const postData = {
                id: msg.id,
                date: new Date(msg.date * 1000).toISOString(),
                text: msg.message ? msg.message.substring(0, 300) : "[Только Медиа]", // Обрезаем текст
                views: msg.views || 0,
                forwards: msg.forwards || 0,
                reactions: [],
                commentsCount: 0,
                top_comments: []
            };

            // 3. Собираем реакции (если они есть)
            if (msg.reactions && msg.reactions.results) {
                postData.reactions = msg.reactions.results.map(r => ({
                    emoticon: r.reaction.emoticon || "custom", // Обычный эмодзи или кастомный
                    count: r.count
                }));
            }

            // 4. Подтягиваем комментарии (если включены обсуждения и есть ответы)
            if (msg.replies && msg.replies.replies > 0) {
                postData.commentsCount = msg.replies.replies;
                
                try {
                    // Делаем запрос на получение сообщений из ветки комментариев
                    const comments = await client.getMessages(channelIdentifier, {
                        replyTo: msg.id,
                        limit: 10 // Берем последние 10 для анализа тональности
                    });
                    
                    postData.top_comments = comments
                        .filter(c => c.message)
                        .map(c => c.message.substring(0, 150)); // Очищаем и обрезаем
                } catch (err) {
                    console.error(`⚠️ Ошибка получения комментариев для поста ${msg.id}:`, err.message);
                }
            }

            analyticsData.push(postData);
        }

        console.log(`✅ Сбор завершен. Собрано постов: ${analyticsData.length}`);
        return analyticsData;

    } catch (error) {
        console.error("❌ Ошибка при сборе аналитики MTProto:", error);
        throw error;
    }
}