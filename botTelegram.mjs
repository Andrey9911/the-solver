import dotenv from 'dotenv';
import {startMPTroto,functionSendCode,
    getDialogs,sendMessageToChat,
    checkSession,
    connectChannelForUpdate,
    parsingJSON} 
    from './scr/js/main.mjs';
import {getCountAccounts,getTitleAccounts,saveOrderToFile, SendFile,removeFile} from './scr/js/work_data_base.mjs';
import { getHolders } from './scr/js/logics.mjs';
import { n8nStart } from './scr/js/n8n.mjs';
import { connectTonWallet, getWalletAddress } from './scr/js/tonAPI.mjs';

dotenv.config();
import { 
  InlineKeyboard, 
  Bot, 
  Keyboard, 
  GrammyError, 
  HttpError, 
  session, 
  InputFile, 
  webhookCallback 
} from "grammy";
import {inlineStartKeyboard,
    keyboardStart,
    detailsWalletActions,
    variantCreate,
    tgFuncKeyb,
    menuMarketPlaceFunc,
    getMenuGenerative,
    choise
    } from './scr/system-func/bot.system-reply.mjs';
import { systemStartMessage,getOrderStatus,getMessageSubscription } from './scr/system-func/bot.system-message.mjs';


import validateAndFormat from './scr/js/validNumber.mjs';
import { json } from 'express';
import connectDB from './scr/js/db/connect.mjs';
import User from './scr/js/db/schema.mjs';


// 1. Подключаемся к БД перед всем остальным
// (Используем top-level await, так как это .mjs)
// await connectDB();


console.log(process.env.BOT_TOKEN);
let data = {}

let status = 'entry'
const bot = new Bot(process.env.BOT_TOKEN); //создаем бота 
function initial() {
    return {
        balance: 1500, // Начальный баланс в рублях (как в вашем примере)
        purchases: [],
        user: new Object({
            id: null, 
            name: '',
            role: 'user',
            bought_accounts: [],
            currentStep: null
        })
        }
          // Массив для хранения купленных аккаунтов/услуг
        // Добавьте другие нужные данные:
        // temp_item_id: null,
    };
bot.use(session({initial})); //Создаем сессию для нашего ботав этом чате

const new_func = new InlineKeyboard()
.text('да','y')
.text('нет','n')



JSON.stringify({"vev":4})


//const menuGenerate = new InlineKeyboard()

//вход в "базу данных"
bot.callbackQuery('enterAccountBase',async e => {
    e.reply(`просмотри и загрузи данные`,{
        reply_markup:menuAdminBD
    })
})

//кнопка назад
bot.callbackQuery("go_back", async (ctx) => {
    console.log();
    
  await ctx.editMessageText(systemStartMessage, {
    reply_markup: inlineStartKeyboard
  });
  await ctx.answerCallbackQuery();
});

//вход в тг акк прослойку
bot.callbackQuery('enterTelegram', async (e)=>{
     status = 'wait_join_tg';
    let id_message = await e.reply('Одну секунду, подключаюсь к удаленному доступу');
    if(checkSession().check){
        e.reply('Отлично, Это твоя админская панель удаленного аккаунта', {reply_markup:tgFuncKeyb})
    }else{
        if (Object.keys(data).length == 0) {
            await e.reply('Оу, тебя нет в моей базе, ща исправим')
            .then(event =>{
                e.reply('введи твой номер телефона^')
                status = 'wait_number'
            })
        }
    }
});

bot.callbackQuery('showChats', async (e)=>{
        const chats = await getDialogs();   // выполняем модуль MTProto
        const keyboard = new InlineKeyboard();

        chats.forEach(chat => {
            keyboard.text(chat.title, "chat_" + chat.id,).row();
        });
        e.reply('Вот твои диалоги. Поговори с ними', {reply_markup:keyboard})
    
})
bot.callbackQuery('support', ext => {
    ext.reply(`Привет, я ai специались-поддержка. 
    Скажи мне подробно, что случилось. 
    Постараюсь помочь`)
    ext.session.user.currentStep = 'wait-text-trable';
})
bot.callbackQuery('SendPromt', (e)=>{
    e.reply('Пришли мне что угодно, на что ты хочешь получить ответ');
    status = 'waitPrompt';
})
bot.callbackQuery('connectTonWallet', async e => {
    await connectTonWallet();
    let my_address = await getWalletAddress();
    e.reply('Кошелек подключен').then((elem)=>{
        e.editMessageText(`Привет, я вижу твой кошелек у нас засветился, вот его адрес:\n <pre>${ my_address}</pre>`, 
            {
                message_id: elem.message_id,
                parse_mode:'HTML',
                reply_markup: detailsWalletActions
            });
    });
})

bot.callbackQuery('y', (e)=>{
    e.reply(`Твой ответ Да\n осталось подвердить твоей подписью`, {reply_markup:menuGenerate})

})
bot.callbackQuery('n', (e)=>{
    e.reply('Твой ответ нет\nосталось подвердить твоей подписью', {reply_markup:menuGenerate})

})

bot.callbackQuery('openGenerateMenu', (e)=>{
    const buttons_AI = parsingJSON('AI',true);
    const menuGenerate = getMenuGenerative(buttons_AI);
    
    console.log(buttons_AI);
    
    

    e.reply('давай начнем', {reply_markup:menuGenerate})

})
bot.callbackQuery('SendPromtForGenerate', event => {
    
    status = 'waitPromptForGenerate';
    event.reply('Пришли мне какой угодно текст, на что ты хочешь получить медиафайл',)
    // event.reply('Выбери тип создания видео', {reply_markup: variantCreate});
    // processing()
})
bot.callbackQuery('cutShorts', event => {
    
    event.reply('Пришли мне видео, любое, от 15 секунд');
    // processing()
    status = 'wait_video';
})
bot.callbackQuery('OpenTonEx', (e)=>{
    return;
    e.reply('давай начнем. Что хочешь посмотреть?', {reply_markup:tonrazvilka})
    
})

bot.callbackQuery('GetAccount', (e)=>{
  status = 'waitAddress'
    e.reply('Введи адрес')
    
    
})

bot.callbackQuery('getJettonWallets', (e)=>{
    e.reply('Введи адрес монеты')
    
})
bot.callbackQuery('postVoit', (e)=>{
    e.reply('Ты можешь отдать голос за новые фишки, которые ты хотел бы видеть здесь в опросе\n Ты можешь проголосовать только один раз');
    e.reply('вот новый пример\nхотел бы ты совершать прямо отсюда транзакции? ', {reply_markup: new_func});
})

// bot.callbackQuery('category-Gemini', (e=>{
//     const data = e.callbackQuery.data.match(/(?<=-).*/)[0];
//     const countAccounts = getCountAccounts(data);
//     console.log('accounts = ', data)
    
//     console.log(countAccounts);
    
//     const menuGemini = new InlineKeyboard()
//     .text(`Аккаунтов GeminiAI - ${countAccounts.count} `,`getAccout-${data}`).row()

//     e.reply(`Ты выбрал категорию GeminiAI
//         вот доступные аккаунты
//         Количество покупок за сегодня 5`,{reply_markup: menuGemini});  
// }))


bot.command('start', async(ctx) => {
    ctx.session.currentStep = 'start';
    let id_message = await ctx.reply('Запускаю n8n...');
    let object_n8n = await n8nStart(process.env.N8N_KEY, 'https://generatesora2youtube-xdmen.amvera.io','sZfsjXrGhwh8anFf')
    .then(data => {
        console.log(data);
        
        if(!data.error){
        ctx.editMessageText('Вы подключились',{
            message_id: id_message.message_id,
        });
    }})
    .catch(err => {
        console.log(id_message);
        ctx.editMessageText('Произошла ошибка при запуске n8n, попробуй позже',{
            message_id: id_message.message_id
        });
    })
    
    
    //проверка, есть ли пользвователь в базе
    if(ctx.session.user.id == null){
        //проверка на владельца
        if(ctx.chat.id.toString() === process.env.OWNER_ID){
            inlineStartKeyboard.text('Зайти в Тг','enterTelegram')
            .text('🔒 Зайти в базу аккаунтов')
            ctx.reply('Приветствую, хозяин!');
            ctx.session.user.id = ctx.chat.id;
            ctx.session.user.name = ctx.chat.username || '';
            ctx.session.user.role = 'owner';
            ctx.session.user.bought_accounts = [];
            console.log('владелец создан в сессии');

        } 
        else{
            ctx.reply('Добро пожаловать, друг!',{reply_markup: keyboardStart});
            ctx.session.user.id = ctx.chat.id;
            ctx.session.user.name = ctx.chat.username || '';
            ctx.session.user.role = 'user';
            ctx.session.user.bought_accounts = [];
            console.log('новый пользователь создан в сессии');
        }
    }
     // Уменьшает кнопки до компактного размера
    await ctx.reply(`привет!`
        , {reply_markup: inlineStartKeyboard}); //Создание встраиваемой клавиатуры

    console.log('бот');
        
    console.log(ctx.chat);
    
})
bot.on("callback_query:data", async ctx => {
    const userId = ctx.from.id;
    const data = ctx.callbackQuery.data;
    const userSession = ctx.session;

    const subscription = parsingJSON('subscriptions',false);

    if(data.startsWith('buyAccount_')){
        const accountType = data.match(/(?<=_).*/)[0];
        const pricing = subscription[accountType].price; 
        console.log('pricing = ');
        console.log(data)
        
        // 1. Проверка баланса
        if(userSession.balance >= pricing){
            
            // 2. Генерация ID заказа (простой пример)
            const orderID = Date.now().toString().slice(-5); 

            // 3. Вызов функции сохранения заказа
            const saveResult = saveOrderToFile(orderID, 1); // 1 - это количество покупок (шт.)

            if (saveResult.success) {
                // 4. Обновление баланса и истории покупок в сессии
                userSession.balance -= pricing;
                userSession.purchases.push({
                    id: orderID,
                    accountType: accountType,
                    price: pricing,
                    date: new Date().toISOString()
                });
                
                // 5. Отправка подтверждения
                await ctx.editMessageText(getOrderStatus(orderID, accountType, pricing, userSession, saveResult),
                {
                    message_id: ctx.callbackQuery.message.message_id,
                    parse_mode: 'Markdown'
                });
                try {
                    const file = SendFile('category', 'account',(accountType).toString(),1);
                    if(file.error) {
                        new Error('yse');
                        return;
                    }
                    console.log('file = ',file);
                    await ctx.replyWithDocument(
                        new InputFile(file.path),
                        {
                            // Опционально: добавить подпись к документу
                            caption: `Ваш заказ ID #из базы данных.`
                        }
                        );
                    console.log(`Файл ${file.path} успешно отправлен.`);
                    removeFile(file.path);

                } catch (error) {
                    console.error("Ошибка при отправке файла:", error);
                    await ctx.reply("Произошла ошибка при отправке файла.");
                }
                
            } else {
                // Ошибка сохранения в файл
                await ctx.answerCallbackQuery(`Ошибка сохранения заказа: ${saveResult.message}`);
            }

        } else {
             await ctx.answerCallbackQuery(`Недостаточно средств. Ваш баланс: ${userSession.balance}₽. Цена: ${pricing}₽.`);
        }
        return; // Выходим после обработки покупки
    }

    if(data.startsWith('category-')){
        const dataType = data.match(/(?<=-).*/)[0];
        
        // const data = e.callbackQuery.data.match(/(?<=-).*/)[0];
        const countAccounts = getCountAccounts(dataType);
        console.log('accounts = ', dataType)
        
        // console.log(countAccounts);
        
        const menuType = new InlineKeyboard()
        .text(`Аккаунтов GeminiAI - ${countAccounts.count} `,`getAccout-${dataType}`).row()

        ctx.editMessageText(`Ты выбрал категорию GeminiAI
            вот доступные аккаунты
            Количество покупок за сегодня 5`,{
                reply_markup: menuType,
                message_id: ctx.callbackQuery.message.message_id
            });  
    }
    if(data == 'StartAssistentVoice'){
        ctx.reply(`Приветик, я твоя собеседница. Давай общаться!
            Пришли мне сообщение, и я отвечу тебе голосом!
            
            Спроси меня о чем угодно, я здесь!`);
        
        status = 'YourCompanion';
    }
    if(data.startsWith('getAccout')){
        console.log(subscription,data.match(/(?<=-).*/)[0]);
        const curr_subscription = subscription[data.match(/(?<=-).*/)[0]]
        // const subscription = data.match(/(?<=-).*/)[0];
        
        
        const keyboard_account = new InlineKeyboard()
        .text('Купить','buyAccount_'+curr_subscription.title);
        console.log('buyAccount_'+curr_subscription.title);
        

        ctx.editMessageText(getMessageSubscription(curr_subscription,getCountAccounts(data.match(/(?<=-).*/)[0]).count),
            {
                message_id: ctx.callbackQuery.message.message_id,
                reply_markup:keyboard_account,
                parse_mode:'HTML'
            })

    }
    if(data == 'openMarketPlace'){

        ctx.session.currentStep = 'marketPlace';
        // Функция создания клавиатуры МаркетПлейс с категориями по названиям аккаунтов
        const menuMarketPlace = menuMarketPlaceFunc(getTitleAccounts);

        ctx.editMessageText(`Добро пожаловать в маркетплейс аккаунтов!
            \nЗдесь ты можешь найти различные аккаунты популярных сервисов\nТвой баланс: ${ctx.session.balance}\n\n🛍 Каталог товаров:`, 
            {
                reply_markup: menuMarketPlace,
                message_id: ctx.callbackQuery.message.message_id
            });

    }
    if(data === 'getChannel'){
        ctx.reply('Введи название канала/бота');
        status = 'wait_channel_title';
    }

     if (data.startsWith("chat_")) {
        const chatId = Number(data.replace("chat_", ""));

        await ctx.answerCallbackQuery("Введите сообщение для отправки.");
        status = 'waitMessageToSendFromUser'+data;
        await ctx.reply("Напиши сообщение, которое отправить:", {
        reply_markup: {
            force_reply: true,
        },})
    }
});
bot.command("buttons", async (ctx) => {
  var keyboard = new InlineKeyboard()
    .text("Да", "btn1")   // первая кнопка
    .text("Нет", "btn2");  // вторая кнопка рядом

  
});
bot.on("message:text", async(ctx) => {
    const text = ctx.message.text;

    //подедржка
    if(ctx.session.user.currentStep === 'wait-text-trable'){
        const choiseKeyBoard = choise('receiving_data_by_email');

        ctx.reply(`Получил! Сейчас разберемся с твоей ситуацией!
            Пока я выполняю твой вызов, выбери, хочешь ли ты получить разбор на твою почту?`, {
                reply_markup: choiseKeyBoard
            })

        //test url https://generatesora2youtube-xdmen.amvera.io/webhook-test/6a5a8c26-6f00-44db-a99f-4755c4580632
        //prod url https://generatesora2youtube-xdmen.amvera.io/webhook/6a5a8c26-6f00-44db-a99f-4755c4580632
        await fetch(`https://generatesora2youtube-xdmen.amvera.io/webhook-test/6a5a8c26-6f00-44db-a99f-4755c4580632`,{
            method: 'POST', // 1. Указываем метод
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: ctx.message.text,
                isSendEmail: false
            })
        })
        .then(rez => {
            console.log('Ожидание тех поддержки');
        })
        .catch(err => ctx.reply(err));
    }
    if(ctx.message.text === 'Главная'){
        ctx.reply('Ты в главном меню, выбери что-то из кнопок ниже', {reply_markup: inlineStartKeyboard});
    }
    if(/chat_/.test(status)){
    const replyToMessage = status.match(/waitMessageToSendFromUser(chat_\d+)/)[1];
    
    const chatId = replyToMessage.replace('chat_','');
    const messageToSend = text;
    
    
    await sendMessageToChat(chatId, messageToSend);
  }
  if(status === 'wait_channel_title'){
    let channel = await connectChannelForUpdate(text);
  }
    if(status == 'waitPromptForGenerate'){
        await fetch(`https://generatesora2youtube-xdmen.amvera.io/webhook-test/b20a768c-2c88-4465-937e-0bb99d5a3a67?idea=${ctx.message.text}`)
        .then(rez => {
            console.log('сработал waitPromt в режиме вебхука');
        })
    }
    //URL PROD 
    ///https://generatesora2youtube-xdmen.amvera.io/webhook/04434806-3c45-4ed0-b3cb-29ceb381f053

    //URL TEST
    ///https://generatesora2youtube-xdmen.amvera.io/webhook-test/04434806-3c45-4ed0-b3cb-29ceb381f053
    if(status == 'waitPrompt'){
        await fetch(`https://generatesora2youtube-xdmen.amvera.io/webhook-test/04434806-3c45-4ed0-b3cb-29ceb381f053?idea=${ctx.message.text}`)
        .then(rez => {
            console.log('сработал waitPromt в режиме вебхука');
        })
    }
    if(status === 'YourCompanion'){
        //test url https://generatesora2youtube-xdmen.amvera.io/webhook-test/cbb5903e-04fd-4292-867c-bc60ed9a2b85
        //prod url https://generatesora2youtube-xdmen.amvera.io/webhook/cbb5903e-04fd-4292-867c-bc60ed9a2b85
        await fetch(`https://generatesora2youtube-xdmen.amvera.io/webhook-test/cbb5903e-04fd-4292-867c-bc60ed9a2b85?idea=${ctx.message.text}`)
        .then(rez => {
            console.log('сработал YourCompanion в режиме вебхука');
        })
        .catch(err => ctx.reply('проcти, не смогла понять тебя, попробуй еще раз'));
    if(status === 'wait_number'){
    if(!data.number){
        if(!validateAndFormat(text).valid){
                ctx.reply(`${text} - не относится к номеру\nеще раз попробуй`);
                return;
        }
        let keyboard = new InlineKeyboard()
            .text("Да", "btn1")   // первая кнопка
            .text("Нет", "btn2");  // вторая кнопка рядом
            data.number = text;
            let id = ctx.reply('Теперь дай пароль 2fa\nУ тебя он есть?',{reply_markup:keyboard}).then(()=>{
                ctx.reply(data);
            })
        // Можно ответить обратно
        ctx.reply(data);
        }
        // else if(!data.fa){
        //     await ctx.reply('окей, осталась малость. Напиши код') 
        // }
        else if(!data.code){
            data.code = text;
            status = 'ready_to_connect';
            ctx.reply('отлично, сейчас подключусь и проверю данные...')
            .then(()=>{
                startMPTroto(data);
            })
        }
        console.log('твои данные на лданные момент');
        // startMPTroto(data)
        // console.log(data);
        
    }
    else if(status === 'waitAddress'){
    ctx.reply('отлично, сейчас проверю информацию по нему...')
    getHolders(ctx.message.text,process.env.API_KEY_TONAPI)
        .then(holders => {
            if(holders.error){
                ctx.reply('У тебя ошибка в адресе, повтори...')
                return;}
            ctx.reply("секунду");
            ctx.reply(holders.dates.addresses);
            return holders;
        })
        .then(rezult =>{
            ctx.reply('сейчас скину топ 5 кошельков с процентным соотношением');
            console.log(rezult);
            
            rezult.top_wallets.forEach((el,key) => {
                let index = 0;
                ctx.reply(`${index} - ${key} : ${el}%`)
                index++;
            })
        })
            
            // holders.forEach(h => {
            //     console.log({
            //         address: h.address,
            //         balance: h.balance,
            //         jetton_wallet: h.jetton_wallet
            //     });
            // });
        .catch(err => console.error(err));
    } 
}});
bot.callbackQuery("btn1", (ctx)=>{
    ctx.answerCallbackQuery("Тогда введи его. Не бойся)");
    return;
});
bot.callbackQuery("btn2", async(ctx)=>{
    data.fa = false;
    ctx.answerCallbackQuery("Отлично, введи просто код, который придет тебе")
        await ctx.reply('введи циферки');
        await functionSendCode(validateAndFormat(data.number).e164);
    return;
});


bot.start();