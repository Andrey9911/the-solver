import dotenv from 'dotenv';
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// import { handler } from './telegram/handlers.mjs';
import { NewMessage } from "telegram/events/index.js";
import { TelegramGroup } from './telegram/tg_group.mjs';

import * as fs from 'fs';
import path from 'path';
import { create } from 'domain';
import { text } from 'stream/consumers';

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


async function  workFile(title_file,content){
  const root_path = 'dataBase/clientTelegram/groups';
  content = JSON.stringify(content);
  
  fs.writeFileSync(`${root_path}/${title_file}.txt`, content);
  
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
  

  
  await ensureConnected();  
  const dialogs = await client.getDialogs();

  // console.log(dialogs[0]);
  
  const chats = dialogs.map(d => ({
    id: d.id,
    title: d.title || d.firstName || d.username || "Без названия",
    isChannel: d.isChannel,
    entery: d.entity
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

//манипуляции с группой
export function createGroupManager() {
  const groupInstance = new TelegramGroup(client);

  return {
    init: async (title, about, isChannel = true) => {
      const isFound = await findAndLink(title);

      if (isFound) {
        console.log('===groipINSTANCE===');
        groupInstance.channelId = JSON.parse(fs.readFileSync(`dataBase/clientTelegram/groups/${title}.txt`, 'utf8')).title
        console.log(groupInstance.channelId);
        return groupInstance.channelId;
      }

      // Если не нашли — создаем новую
      console.log("🆕 Группа не найдена, создаем новую...");
      const channelObj = await groupInstance.create(title, about, isChannel);
      workFile(title,channelObj.content)
      return channelObj.result;
    },

    publish: async (text) => {
      if (!groupInstance.channelId) throw new Error("Сначала вызовите .init()!");
      return await groupInstance.publishPost(text);
    },
    publicPhoto: async (text,fileId) => {
      if (!groupInstance.channelId) throw new Error("Сначала вызовите .init()!");
      return await groupInstance.publicWithPhoto(text,fileId);
    },
    
    //узнать текущий ID
    getId: () => groupInstance.channelId
  };
}

export async function downloadFiles(file) {
  const savePath = path.join(__dirname, "downloads", `${file.file_unique_id}.jpg`);
  
  await file.download(savePath);
}
async function findAndLink(targetTitle) {
        console.log(`🔍 Ищу группу "${targetTitle}" среди диалогов...`);
        await ensureConnected();  
        // Получаем диалоги (последние). 
        // Если групп очень много, можно добавить опцию limit: 0 (все), но это будет дольше.
        const dialogs = await client.getDialogs({});

        // Ищем точное совпадение по названию
        const foundDialog = dialogs.find(d => d.title === targetTitle);

        if (foundDialog) {
            console.log(`✅ Группа найдена! ID: ${foundDialog.id}`);
            return true;
        }

        console.log("⚠️ Группа не найдена.");
        return false;
    }

//получить список моих групп
export async function getMyChannels(client) {
  let chats = await getDialogs();
        
        const myGroups = chats.filter(dialog => {
            // console.log(dialog.entery);
            return (dialog.entery.creator === true)});
      // Получаем каналы, где пользователь — админ
      console.log(myGroups)
      
      
      return myGroups.map(chat => ({
          id: chat.id.toString(),
          title: chat.title,
          username: chat.username
      }));
  }