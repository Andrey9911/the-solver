const http = require('http'); // включение модуля из стандартной библиотеки Node.js
const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const app = express();

app.use(express.static(__dirname))
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
//   fs.readFile(__dirname + "/index.html")
//   .then(contents => {
//     res.setHeader("Content-Type", "text/html");
//     res.writeHead(200);
//     res.end(contents);
// })
//   console.log(__dirname);
  
});
                              // запуск веб-сервера
app.listen(3333, () => {
    console.log('Application listening on port 8080!');
});
