import { 
    Bot, InlineKeyboard,Composer
  } from "grammy";
  import ccxt from "ccxt";
  import  {createHmac} from 'crypto';
  import dotenv from "dotenv";
  import { env } from "process";
import { getAutoPostingConfigMenu } from "../../system-func/bot.system-reply.mjs";
  dotenv.config();

  
  
  export const autoposting = new Composer();

  autoposting.on("callback_query:data", async ctx => {
    const data = ctx.callbackQuery.data;
    console.log('==АВТОПОСТИНГ НАСТРОЙКИ==');
    console.log(data);
    
    // Нажатие на "Запустить автопостинг" из главного меню
    if (data === 'startAutoPosting') {
        await ctx.editMessageText("Настройка конфига автопостинга:", {
            reply_markup: getAutoPostingConfigMenu(ctx.session.user.config)
        });
        await ctx.answerCallbackQuery();
        return;
    }

    // Переключение isMedia (0 -> 1 -> 2 -> 0)
    if (data === 'toggle_isMedia') {
        let current = ctx.session.user.config.isMedia;
        ctx.session.user.config.isMedia = (current + 1) % 3;
        
        await ctx.editMessageReplyMarkup({
            reply_markup: getAutoPostingConfigMenu(ctx.session.user.config)
        });
        await ctx.answerCallbackQuery();
        return;
    }

    // Запрос ввода интервала
    if (data === 'set_interval_val') {
        ctx.session.status = 'wait_interval';
        await ctx.reply("Введите интервал автопостинга в секундах (например, 300):");
        await ctx.answerCallbackQuery();
        return;
    }

    // Финальная отправка конфига (запрос с телом)
    if (data === 'confirm_autoposting') {
        const finalConfig = {
            isMedia: ctx.session.user.config.isMedia,
            interval: ctx.session.user.config.interval,
            autoposting: ctx.session.user.config.autoposting,
            channel_id: ctx.session.user.group.id
        };

        if (!config.autoposting) {

        
            try {
                // Отправка в n8n или ваш внутренний менеджер
                await fetch("https://generatesora2youtube-xdmen.amvera.io/webhook-test/marta-autopost", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalConfig)
                });
                await ctx.reply("✅ Автопостинг успешно запущен с вашими настройками!");
                await ctx.answerCallbackQuery("Автопостинг включен ✅");
                config.autoposting = true
            } catch (e) {
                await ctx.reply("❌ Ошибка при запуске автопостинга.");
            }
        }else{
            
                // ЛОГИКА ОСТАНОВКИ
                try {
                    // Уведомляем n8n или ваш скрипт об остановке
                    // await n8nStop(ctx.session.user.group.id);
                    
                    await ctx.answerCallbackQuery("Автопостинг остановлен ❌");
                    config.autoposting = false
                } catch (e) {
                    return await ctx.answerCallbackQuery("Ошибка при остановке");
                }
        }
        
        ctx.session.status = 'managementGroup';
        await ctx.answerCallbackQuery();
        return;
    }
  })
  
  autoposting.on("message:text", async ctx => {
    if (ctx.session.status === 'wait_interval') {
        const seconds = parseInt(text);
        
        if (isNaN(seconds) || seconds <= 0) {
            await ctx.reply("Пожалуйста, введите корректное число секунд.");
            return;
        }

        // Обновляем значение в сессии
        ctx.session.user.config.interval = seconds;
        ctx.session.status = 'managementGroup';
        await ctx.reply(`Интервал обновлен: ${seconds} сек.`, {
            reply_markup: getAutoPostingConfigMenu(ctx.session.user.config)
        });
        return;
    }
  }

)