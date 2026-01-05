import dotenv from 'dotenv';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// import { handler } from './telegram/handlers.mjs';
import { NewMessage } from "telegram/events/index.js";

import * as fs from 'fs';
import { log } from 'console';

dotenv.config();

const apiId = Number(process.env.ID_TELEGRAM);
const apiHash = String(process.env.API_HASH);
const SESSION_FILE = "session.txt";
let sessionString = "";

 checkSession()//проверка, была ли авторизация ранее

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
  });



  // const session = new StringSession(""); // можно сохранить строку после первого входа
  // const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });





let data_user = {};
let isConnected = false;

async function ensureConnected() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('TelegramClient connected');
  }
}

export function parsingJSON(type,isButton){
  try{
    
      if(isButton){
          const buttons = fs.readFileSync('./buttons.json', 'utf8')
              const parsedData = JSON.parse(buttons)[type];
              return parsedData;
        }
      else{
        const category = JSON.parse(fs.readFileSync('./dataBase/json.reply/texts.json', 'utf8'));


        console.log('data category');
        console.log(category);
        return category[type];
      }
    }catch(err){
    console.error('Ошибка при парсинге JSON:', err);
    return;
  };
  
}


export async function startMPTroto(data_user){
  if (!sessionString){
      await ensureConnected();

    // console.log('Starting TelegramClient with user data:', data_user); 
    await client.start({
      phoneNumber:async () => {
        // Возвращаем код как функцию
        return data_user.number;
      },
      password:async () => {
        // Возвращаем код как функцию
        return data_user.fa || 'underfined';
      },
      phoneCode: async () => {
        // Возвращаем код как функцию
        return data_user.code;
      },
      onError: (err) => {
        console.log(err);
        return;
      }
    });
    fs.writeFileSync("session.txt", client.session.save());
  }else {
    // Если сессия есть — просто подключаемся
    await client.connect();
  }
  
  const messages = await client.getMessages(channel, { limit: 10 });

  await client.sendMessage(dialogs.find(elem => elem.title === 'XDMEN').title,{message:'HI'})
  // console.log(dialogs);
  for (const chat of dialogs) {
    // console.log(chat);
  }
};

//взять под управление канал
 export async function connectChannelForUpdate(channel_id){
  await ensureConnected();
  try{
    client.getInputEntity
    const channel = await client.getEntity(`t.me/${channel_id}`);
    console.log('===channel==='+channel.title)
    // console.log(channel)
  }catch(error){
    console.log(error);
    return {
      error: error
    }
  }
    
  }

export async function functionSendCode(number){
  try {
    await ensureConnected();
    console.log('жди');

    //создания "базы данных"
    fs.writeFileSync("data_user.json", JSON.stringify({
      number: number,
      apiHash: apiHash,
      apiId: apiId
    }, null, 2));

    data_user.number = number,
    data_user.apiHash = apiHash,
    data_user.apiId = apiId

    console.log(await client.sendCode(client, number));
  } catch (error) {
    console.error('Ошибка при отправке кода:', error);
  }
   
}
export async function sendMessageToChat(chatId, message) {
  await ensureConnected();
  return await client.sendMessage(chatId, { message: message });
}
export async function getDialogs(){
  console.log('===client===');
  
  // console.log(client);
  
  await ensureConnected();  
  const dialogs = await client.getDialogs();

  // console.log(dialogs[0]);
  
  const chats = dialogs.map(d => ({
    id: d.id,
    title: d.title || d.firstName || d.username || "Без названия",
  }));
  return chats;
}

export function checkSession() {
  // fs.readFileSync("./data_user.json");
  sessionString = fs.readFileSync(SESSION_FILE, "utf8");
  const path = './session.txt';
  if (fs.existsSync(path)){
    fs.readFileSync("session.txt", "utf8");
    console.log('Config file found');
    return {
      check: true
    }
  } else{
    console.warn('Config file missing');
    return {
      check: false
    }
  }
}


//проверка обновлений по mtproto
client.addEventHandler(handler, new NewMessage({
    incoming: true
}));

async function handler(event) {
    const message = event.message;

    // Игнорируем пустые сообщения или сервисные уведомления
    if (!message.text) return;

    console.log(`Получено сообщение: ${message.text} из чата ${message.chatId}`);
    
    // Пример ответа (как юзер-бот)
    if (message.text === "Привет") {
      await client.sendMessage(message.chatId, {message: 'Привет,я твой друг'})
    }
}