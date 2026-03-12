import dotenv from 'dotenv';
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// import { handler } from './telegram/handlers.mjs';
import { NewMessage } from "telegram/events/index.js";
import { TelegramGroup } from './telegram/tg_group.mjs';

import * as fs from 'fs';
import path from 'path';

import { BSON } from "bson";

import { create } from 'domain';
import { text } from 'stream/consumers';

dotenv.config();

const apiId = Number(process.env.ID_TELEGRAM);
const apiHash = String(process.env.API_HASH);
const SESSION_FILE = "session.txt";
let sessionString = "";

 checkSession()//проверка, была ли авторизация ранее

  export const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
  });


  // const session = new StringSession(""); // можно сохранить строку после первого входа
  // const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });





let data_user = {};
let isConnected = false;

export async function ensureConnected() {
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
export async function getMyChannels(client, id) {
  // Получаем все диалоги
  let chats = await getDialogs(client); 
  
  const myGroups = chats.filter(dialog => {
      const dialogId = dialog.id.toJSNumber();

      // Если ID не передан (undefined) -> возвращаем только те, где я создатель
      if (id === undefined) {
          return dialog.entery.creator === true;
      } 
      
      // Если ID передан -> возвращаем либо этот конкретный канал, 
      // либо все каналы, где я создатель (чтобы список не пустел)
      // Приводим id к числу на случай, если пришла строка
      return (dialog.entery.creator === true || dialogId === Number(id));
  });

  console.log(`Найдено каналов: ${myGroups.length}`);

  return myGroups.map(chat => ({
      id: chat.id.toString(), // Преобразуем в строку для callback_data
      title: chat.title,
      username: chat.entery.username || 'no_username'
  }));
}

/**
 * Configuration
 */
const channelIdentifier = process.env.CHANNEL; // username or channel ID

//Fetch last N text posts from a Telegram channel

export async function fetchPosts(channel, limit = 10) {
    try {
        const entity = await client.getEntity(channel);
        const messages = await client.getMessages(entity, {
            limit: undefined // fetch extra to filter properly
        });
        const textPosts = [];
        
        for (const message of messages) {
            // Ignore service/system messages
            if (message instanceof Api.MessageService) continue;
            // Ignore empty messages
            if (!message.message || message.message.trim() === "") continue;
            textPosts.push(message.message);

            if (textPosts.length >= limit) break;
        }
        //сохранение все в бинарный вид для векторных данных
        saveToJson(textPosts);

        return textPosts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
}

/**
 * Save dataset to JSON file
 */
async function saveToJson(data, filename = "style_dataset.json") {
    try {

        const json = JSON.stringify(data, null, 2);
        await fs.writeFile(filename, json, "utf-8",(err) => {
          if (err) throw err;
        });
        console.log(`Saved JSON dataset to ${filename}`);

    } catch (error) {
        console.error("Error saving JSON:", error);
        throw error;
    }
}

/**
 * Convert JSON data to binary format (Buffer or BSON)
 */
async function convertToBinary(data, filename = "style_dataset.bin") {
    try {
        // Using BSON serialization for structured binary storage
        const bsonData = BSON.serialize({ posts: data });
        const buffer = Buffer.from(bsonData);

        await fs.writeFile(filename, buffer);
        console.log(`Saved binary dataset to ${filename}`);
    } catch (error) {
        console.error("Error converting to binary:", error);
        throw error;
    }
}

/**
 * Create system_prompt.json file
 */
async function createSystemPrompt(system_prompt) {
    try {
        const systemPrompt = {
            instruction: system_prompt || "You are a neural network trained to replicate the stylistic and structural patterns found in the provided dataset. Preserve tone, vocabulary, formatting, and writing rhythm."
        };

        await fs.writeFile(
            "system_prompt.json",
            JSON.stringify(systemPrompt, null, 2),
            "utf-8"
        );

        console.log("Saved system_prompt.json");
    } catch (error) {
        console.error("Error creating system prompt:", error);
        throw error;
    }
  }