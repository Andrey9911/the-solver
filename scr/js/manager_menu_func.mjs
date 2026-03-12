import { 
    Bot, InlineKeyboard,Composer
  } from "grammy";
  import { client } from "telegram";
  import ccxt from "ccxt";
  import  {createHmac} from 'crypto';
  import dotenv from "dotenv";
  import { env } from "process";
  dotenv.config();
  import { getChannelAnalytics360 } from "./telegram/analysator_channel.mjs";
  
  
  export const managerMenuFunc = new Composer();

managerMenuFunc.on("callback_query:data", async ctx => {
    const data = ctx.callbackQuery.data;
    if (data === 'giveIdea') {
        ctx.session.status = 'wait_idea';
        await ctx.editMessageText("Отправь свою идею как текст или голосовое сообщение.", {
            reply_markup: new InlineKeyboard().text("Cancel", "cancelAction")
        });
        await ctx.answerCallbackQuery();
        return;
    }
    
    // Handle "Knowledge base"
    if (data === 'knowledgeBase') {
        ctx.session.status = 'wait_kb_document';
        await ctx.editMessageText("отправь PDF/DOCX файл, текстовый список или голосовое сообщение для базы знаний.", {
            reply_markup: new InlineKeyboard().text("Cancel", "cancelAction")
        });
        await ctx.answerCallbackQuery();
        return;
    }
    
    // Handle "Comment analytics"
    if (data === 'commentAnalytics') {
        await ctx.answerCallbackQuery("Собираю данные... Это займет пару секунд ⏳");
    
        // Получаем ID/username канала из сессии
        const channelId = ctx.session.user.group.id; 
        
        try {
            const analyticsJson = await getChannelAnalytics360(channelId);
            
            // Отправляем сырой массив в n8n к ИИ-агенту
            const n8nResponse = await fetch('https://generatesora2youtube-xdmen.amvera.io/webhook-test/telegram-bot-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'analytics',
                    user_id: ctx.from.id,
                    channel_id: channelId,
                    payload: analyticsJson
                })
            });
            
            // n8n может вернуть готовый текстовый ответ, который бот перешлет
            const finalReport = await n8nResponse.json();
            await ctx.reply(finalReport.report);
            
        } catch (e) {
            await ctx.reply("Произошла ошибка при сборе данных.");
            console.log(e);
            
        }
    }
    
    
})

// Файл: botTelegram.mjs

// --- Обработка текстовых сообщений ---
managerMenuFunc.on("message:text", async(ctx) => {
    const text = ctx.message.text;

    // ... ваши существующие проверки статусов ...

    if (ctx.session.status === 'wait_idea') {
        const channelId = ctx.session.user.group.id;
        await ctx.reply("Отправляю идею в n8n...");
        try {
            await fetch(process.env.N8N_IDEA_WEBHOOK_URL || 'https://generatesora2youtube-xdmen.amvera.io/webhook-test/telegram-bot-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'idea', format: 'text', content: text, channelId: channelId })
            });
            await ctx.reply("✅ Идея успешно отправлена!");
        } catch (error) {
            await ctx.reply("❌ Ошибка отправки в n8n.");
        }
        ctx.session.status = 'managementGroup'; // Возвращаем статус управления
        return;
    }

    if (ctx.session.status === 'wait_kb_document') {
        const channelId = ctx.session.user.group.id;
        await ctx.reply("Добавляю текст в базу знаний...");
        try {
             await fetch(process.env.N8N_KB_WEBHOOK_URL || 'https://generatesora2youtube-xdmen.amvera.io/webhook-test/telegram-bot-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Добавляем тег type: knowledge_base как просили
                body: JSON.stringify({ type: 'knowledge_base', format: 'text', content: text, channelId: channelId })
            });
            await ctx.reply("✅ Текст добавлен в базу знаний!");
        } catch (error) {
            await ctx.reply("❌ Ошибка обновления базы знаний.");
        }
        ctx.session.status = 'managementGroup';
        return;
    }
});

// --- Обработка голосовых сообщений (Whisper) ---
managerMenuFunc.on("message:voice", async (ctx) => {
    const fileId = ctx.message.voice.file_id;
    const channelId = ctx.session.user.group.id;

    if (ctx.session.status === 'wait_idea') {
        await ctx.reply("Отправляю голосовую идею в n8n для распознавания (Whisper)...");
         try {
            // Отправляем fileId, в n8n нужно будет использовать ноду Telegram "Get File"
            await fetch(process.env.N8N_IDEA_WEBHOOK_URL || 'https://generatesora2youtube-xdmen.amvera.io/webhook-test/telegram-bot-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'idea', format: 'voice', fileId: fileId, channelId: channelId })
            });
            await ctx.reply("✅ Голосовая идея ушла в обработку!");
        } catch (error) {
            await ctx.reply("❌ Ошибка отправки голосовой идеи.");
        }
        ctx.session.status = 'managementGroup';
        return;
    }

    if (ctx.session.status === 'wait_kb_document') {
        await ctx.reply("Отправляю голосовое сообщение в базу знаний...");
         try {
             await fetch(process.env.N8N_KB_WEBHOOK_URL || 'https://generatesora2youtube-xdmen.amvera.io/webhook-test/telegram-bot-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'knowledge_base', format: 'voice', fileId: fileId, channelId: channelId })
            });
            await ctx.reply("✅ Голосовое сообщение добавлено в базу знаний!");
        } catch (error) {
            await ctx.reply("❌ Ошибка обновления базы знаний.");
        }
        ctx.session.status = 'managementGroup';
        return;
    }
});

// --- Обработка документов (PDF/DOCX) ---
managerMenuFunc.on("message:document", async (ctx) => {
    const fileId = ctx.message.document.file_id;
    const fileName = ctx.message.document.file_name;
    const channelId = ctx.session.user.group.id;

    if (ctx.session.status === 'wait_kb_document') {
        await ctx.reply(`Отправляю документ ${fileName} в базу знаний...`);
        try {
             await fetch(process.env.N8N_KB_WEBHOOK_URL || 'https://generatesora2youtube-xdmen.amvera.io/webhook-test/telegram-bot-backend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Отправляем с тегом knowledge_base
                body: JSON.stringify({ 
                    type: 'knowledge_base', 
                    format: 'document', 
                    fileId: fileId, 
                    fileName: fileName,
                    channelId: channelId 
                })
            });
            await ctx.reply("✅ Документ добавлен в базу знаний!");
        } catch (error) {
            await ctx.reply("❌ Ошибка отправки документа.");
        }
        ctx.session.status = 'managementGroup';
        return;
    }
});