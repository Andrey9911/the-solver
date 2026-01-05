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


// Клавиатура в стартовом сообщении
export const inlineStartKeyboard = new InlineKeyboard()
    .text("🤖 AI", "openGenerateMenu")
    .text('🛍️ МаркетПлейс','openMarketPlace').row()
    .text("🔒 ЗАЙТИ В TON ОБОЗРЕВАТЕЛЬ", "OpenTonEx").row()
    .text('👨🏻‍💻 Поддержка','support')

// Главное клавиатура
export const keyboardStart = new Keyboard()
    .text("Профиль","profil")
    .text("Главная",'start')
    .resized();


// Клавиатура для основных функций админа в тг
export const tgFuncKeyb = new InlineKeyboard()
.text('просмотр чатов', 'showChats')
.text('🔒 просмотреть канал/бот','getChannel')


// Клавиатура для развилки по тонам
export  const tonrazvilka = new InlineKeyboard()
    .text("конкретный адрес", "GetAccount")
    .text("холдеров монеты", "getJettonWallets")
    .text("Проголосовать", "postVoit")

// Клавиатура для действий с кошельком в профиле
export const detailsWalletActions = new InlineKeyboard()
    .text('Заменить кошелек','editWallet')

// Клавиатура для выбора варианта создания видео
export const variantCreate = new InlineKeyboard()
    .text("Generate", "GenerateVideo")
    .text("Download&Public", "DownloadAndPublic")  


export function choise(id){
    const v = new InlineKeyboard()
        .text('Да',`id_${id}`)
        .text('Нет',`id_${id}`)
    
    return v;
}
// Функция создания клавиатуры МаркетПлейс с категориями по названиям аккаунтов
export function menuMarketPlaceFunc(getTitleAccounts){
    const menuMarketPlace = new InlineKeyboard()
                // .text('GeminiAI -1000-','category_Gemini').row()
                // .text('OpenAI -500-','category_OpenAI').row()
                // .text('Пополни баланс','pushBalabce').row()
    
    const array_title_acconts = getTitleAccounts();
    array_title_acconts.forEach((el,i, array) => {
        menuMarketPlace.text(el,'category-'+el).row();
        if(i == array.length - 1 ){
                menuMarketPlace.text("⬅️ Назад", "go_back");
            }
    })
    return menuMarketPlace;
}

export function getMenuGenerative(buttons_AI){
    const menuGenerate = new InlineKeyboard();
    Object.keys(buttons_AI).forEach(btn => {
            console.log(btn, buttons_AI[btn]);
            
            menuGenerate.text(btn, buttons_AI[btn]).row();
    });
    return menuGenerate;
}
