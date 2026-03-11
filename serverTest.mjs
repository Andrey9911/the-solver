import express from 'express';
import fs from 'fs';
import path from 'path';
import http from 'http';
import openAI from "./scr/js/ai.mjs";
import { n8nSearchRoutes } from './scr/js/api/n8n-search-channels.mjs';
import { botHandler } from './botTelegram.mjs';

const __dirname = import.meta.dirname;

const app = express();

// JSON body для API (нужно для n8n и поиска каналов)
app.use(express.json());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  console.log(openAI('1+1'));
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/decision', (req, res) => {
  console.log(openAI('1+1'));
});

// API для n8n (поиск каналов по ключевому слову)
app.use('/api/n8n', n8nSearchRoutes);

app.post('/', (req, res) => {
  console.log('--- Получено сообщение от Telegram ---');
  // Передаем запрос в grammY
  return botHandler(req, res);
});

// grokn.io / Railway / и др. подставляют PORT, локально — 3333
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Application listening on port ${PORT}!`);
});
