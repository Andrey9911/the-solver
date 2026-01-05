import express from 'express';
import fs from 'fs';
import path from 'path';
import http from 'http';
import openAI from "./scr/js/ai.mjs" ;
const __dirname = import.meta.dirname;

const app = express();



app.use(express.static(__dirname))
app.get('/', (req, res) => {
  console.log(openAI('1+1'));
  res.sendFile(`${__dirname}/index.html`);
//   fs.readFile(__dirname + "/index.html")
//   .then(contents => {
//     res.setHeader("Content-Type", "text/html");
//     res.writeHead(200);
//     res.end(contents);
// })
//   console.log(__dirname);
  
});
app.get('/decision', (req, res) => {
  console.log(openAI('1+1'));
})
                              // запуск веб-сервера
app.listen(3333, () => {
    console.log('Application listening on port 8080!');
});
