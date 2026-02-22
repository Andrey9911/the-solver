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
    // .text('🛍️ МаркетПлейс','openMarketPlace')
    // .text("🔒 ЗАЙТИ В TON ОБОЗРЕВАТЕЛЬ", "OpenTonEx").row()
    .text(' Зайти в Тг','enterTelegram')
    .text('👨🏻‍💻 Поддержка','support')

// Главное клавиатура
export const keyboardStart = new Keyboard()
    .text("Профиль","profil")
    .text("Главная",'start')
    .resized();


// Клавиатура для основных функций админа в тг
export const tgFuncKeyb = new InlineKeyboard()
.text('просмотр чатов', 'showChats').row()
.text('🧪 менеджер каналов','getChannels')
.text('мониторинг групп-конкурентов','getPostsOtherChannel').row()
.text('назад','back')




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

export const menegareGroup = new InlineKeyboard()
  .text('📝 Создать пост', 'createPost')
  .text('🗑️ Удалить пост', 'deletePost')
  .row() // Можно добавить разделитель ряда для красоты
  .text('👁️ Просмотреть посты', 'viewPosts')
  .text('✏️ Редактировать пост', 'editPost')
  .text('запустить автопостинг','startAutoPosting').row()

export function choise(id){
    console.log(id);
    
    const v = new InlineKeyboard()
        .text('Да',`id_${id}-y`)
        .text('Нет',`id_${id}-n`)
    
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

export function getMenuMyChannel(buttons_groups){
    let buttons = new InlineKeyboard();
    const buttonsObj = buttons_groups.forEach((el,i, array) => {

        buttons.text(el.title,'set_target_'+el.id).row();
    })
    buttons.text("Создать новую", "createGroup");
    buttons.text("⬅️ Назад", "go_back");

    return buttons;
}
