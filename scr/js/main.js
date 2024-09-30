// const Telegram = require('@twa-dev/sdk');
// import WebApp from '@twa-dev/sdk'


import openAI from "./ai.mjs" ;

let tg = window.Telegram.WebApp;
const url = 'https://photomath1.p.rapidapi.com/maths/v2/solve-problem';
const data = new FormData();
data.append('locale', 'en');

const options = {
	method: 'POST',
	headers: {
		'x-rapidapi-key': '7f75cbbc5dmsh94f644ecb9832a1p10a2bajsn4e4e25b606fd',
		'x-rapidapi-host': 'photomath1.p.rapidapi.com'
	},
	body: data
};

console.log(document.querySelector('input[type="submit"]'));

document.querySelector('input[type="submit"]').addEventListener('click',async el => {
    el.preventDefault();
    try {
        document.querySelector('res').textContent = openAI(el.target.value)
    } catch (error) {
    }
})


// Telegram.default.sendData('')