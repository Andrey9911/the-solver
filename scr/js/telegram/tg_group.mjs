import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";


export class TelegramGroup {
    /**
     * @param {TelegramClient} client - Авторизованный экземпляр GramJS
     */
    constructor(client) {
        this.client = client;
        this.channelId = null;
        this.accessHash = null;
        this.title = "";
        this.posts = []; // Локальное хранилище постов (архив)
    }

    /**
     * Создание новой группы (супергруппы) или канала
     * @param {string} title - Название
     * @param {string} about - Описание
     * @param {boolean} isChannel - true для канала, false для группы
     */
    async create(title, about = "", isChannel = true) {
        await ensureConnected();  // Убедимся, что клиент подключен
        try {
            const result = await this.client.invoke(
                new Api.channels.CreateChannel({
                    title: title,
                    about: about,
                    broadcast: isChannel,
                    megagroup: !isChannel,
                })
            );

            const channelData = result.updates[1].channelId;
            this.channelId = channelData;
            this.title = title;
            
            console.log(`✅ Создано: ${title} (ID: ${this.channelId})`);
             
            return {
                result: result,
                content:{
                    title:this.title,
                    channelId:this.channelId
                }
            };
        } catch (error) {
            console.error("❌ Ошибка при создании:", error.message);
        }
    }

    /**
     * Публикация текстового поста
     * @param {string} text - Текст сообщения
     */
    async publishPost(text) {
        // await ensureConnected();  // Убедимся, что клиент подключен
        if (!this.channelId) throw new Error("Сначала создайте или привяжите группу!");

        try {
            const message = await this.client.sendMessage(this.channelId, {
                message: text,
            });

            // Сохраняем пост в локальную историю
            const postEntry = {
                id: message.id,
                date: message.date,
                text: message.message,
            };
            this.posts.push(postEntry);

            console.log(`🚀 Пост опубликован. ID: ${message.id}`);
            return message;
        } catch (error) {
            console.error("❌ Ошибка публикации:", error.message);
        }
    }
    async publicWithPhoto(text, fileId) {
        // await ensureConnected();  // Убедимся, что клиент подключен
        if (!this.channelId) throw new Error("Сначала создайте или привяжите группу!");
        try {
            const message = await this.client.sendFile(this.channelId, {
                file: fileId,
                caption: text,
                parseMode: "html", // Позволяет использовать HTML в описании
            });

            // Сохраняем информацию о посте в локальный архив
                this.posts.push({
                id: message.id,
                date: message.date,
                text: text,
                type: 'photo'
            });

            console.log(`📸 Фото опубликовано успешно. ID: ${message.id}`);
            return message;
        } catch (error) {
            console.error("❌ Ошибка при публикации фото:", error.message);
        }
    }

    /**
     * Получение истории постов из Telegram и синхронизация с локальным хранилищем
     * @param {number} limit - Сколько последних постов загрузить
     */
    async syncHistory(limit = 20) {
        if (!this.channelId) return;

        const history = await this.client.getMessages(this.channelId, {
            limit: limit,
        });

        this.posts = history.map(m => ({
            id: m.id,
            date: m.date,
            text: m.message
        }));

        console.log(`🔄 Синхронизировано ${this.posts.length} постов.`);
    }

    /**
     * Удаление поста по ID
     * @param {number} messageId 
     */
    async deletePost(messageId) {
        await ensureConnected();  // Убедимся, что клиент подключен
        try {
            await this.client.deleteMessages(this.channelId, [messageId], {
                revoke: true,
            });
            this.posts = this.posts.filter(p => p.id !== messageId);
            console.log(`🗑 Пост ${messageId} удален.`);
        } catch (error) {
            console.error("❌ Ошибка удаления:", error.message);
        }
    }

    /**
     * Геттер для получения всех постов из памяти класса
     */
    get localArchive() {
        return this.posts;
    }
}
