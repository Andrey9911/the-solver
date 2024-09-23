require('dotenv').config();
const {InlineKeyboard, Bot, Keyboard, GrammyError, HttpError, session, InputFile, webhookCallback,} = require("grammy");
console.log(process.env.BOT_TOKEN);

const bot = new Bot(process.env.BOT_TOKEN); //создаем бота 

bot.use(session()); //Создаем сессию для нашего ботав этом чате

const inlineKeyboard = new InlineKeyboard()
    .text("Open Solver app", "openSolverApp")


bot.command('start', async(ctx) => {
    await ctx.reply(`привет!
        Ты можешь открыть меня и решить любой пример`
        , {reply_markup: inlineKeyboard}); //Создание встраиваемой клавиатуры
    await bot.api.sendMessage(ctx.chatId,'https://t.me/botusername?startapp')
})
bot.callbackQuery('openSolverApp', (e)=>{
    console.log(e);
    
})
bot.start();