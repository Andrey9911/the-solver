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
// import { category } from "../../dataBase/json.reply/texts.json";

export const systemStartMessage = `выбери что-то что по душе`;

export function getOrderStatus(orderID,accountType,pricing,userSession,saveResult){
    return `✅ **Покупка завершена!**
                
                **Заказ ID:** #${orderID}
                **Товар:** ${accountType}
                **Цена:** ${pricing}₽
                
                **Ваш новый баланс:** ${userSession.balance}₽
                (Данные сохранены в базе данных: ${saveResult.filePath})`
}

export function getMessageSubscription(data,count){
    
    return `📝 Подписка <b>${data.title}</b> на 1 год
    
            · Включает доступ к передовым ИИ моделям: ChatGPT, Claude, Gemini, Grok, Kimi, Sonar. 
    
            · Сервис доступен в РФ без VPN
    
            · Вам нужно просто создать аккаунт или уже на существующем ввести промокод
    
    💰 Цена: ${data.price}
    📦 В наличии: <b>${count} шт</b>`
}

export function support(){
  return {
    text:`Привет, я ai специались-поддержка. 
    Скажи мне подробно, что случилось. 
    Постараюсь помочь`
  }
}