import { 
  Bot, InlineKeyboard,Composer
} from "grammy";
import ccxt from "ccxt";
import  {createHmac} from 'crypto';
import dotenv from "dotenv";
import { env } from "process";
dotenv.config();


export const bybitModule = new Composer();
class BybitTradingEngine {
  constructor() {
    this.exchange = new ccxt.bybit({
      apiKey: process.env.BYBIT_API_KEY,
      secret: process.env.BYBIT_API_SECRET,
      enableRateLimit: true,
      options: { 'defaultType': 'spot' } // Работаем со спотом
    });
  }

  // 1. Загрузка рынков
  async init() {
    await this.exchange.loadMarkets();
    console.log('✅ Markets loaded');
  }

  async getSignature(){
    const query = 'category=spot&limit=20';
    const timestamp = Date.now().toString();
    const recvWindow = '10000';
    const endpoint = '/v5/order/history';

    const signPayload = timestamp + env.BYBIT_API_KEY + recvWindow + query;
    const signature = createHmac('sha256', env.BYBIT_API_SECRET).update(signPayload).digest('hex');

    return {
      api:env.BYBIT_API_KEY,
      secret: env.BYBIT_API_SECRET,
      signature:signature,
      timestamp:timestamp,
      recvWindow:recvWindow
    }
  }
  // 2. Функция безопасной проверки возможности выпустить ордер
  async canPlaceSellOrder(symbol, amount, price) {
    const market = this.exchange.market(symbol);

    // Округляем по precision биржи
    const preciseAmount = Number(this.exchange.amountToPrecision(symbol, amount));
    const precisePrice = Number(this.exchange.priceToPrecision(symbol, price));

    const notional = preciseAmount * precisePrice;

    const minAmount = market.limits?.amount?.min || 0;
    const minNotional = market.limits?.cost?.min || 0;

    if (preciseAmount < minAmount) {
      console.log(`⛔ ${symbol} amount < minAmount (${minAmount})`);
      return false;
    }

    if (notional < minNotional) {
      console.log(`⛔ ${symbol} notional < minNotional (${minNotional})`);
      return false;
    }

    return {
      amount: preciseAmount,
      price: precisePrice
    };
  }

  // 3. Сама логика торговли
  async runTradeLogic() {
    // Получаем балансы
    const balance = await this.exchange.fetchBalance();
    const inventory = balance.info.result.list[0].coin; 

    for (const item of inventory) {
      const freeAmount = parseFloat(item.walletBalance);
      if (freeAmount <= 0 || item.coin === 'USDT') continue;

      const symbol = `${item.coin}/USDT`;

      if (!this.exchange.markets[symbol]) {
        console.log(`⚠️ Пара ${symbol} не найдена`);
        continue;
      }

      try {
        const ticker = await this.exchange.fetchTicker(symbol);
        console.log(`💰 ${symbol} | Баланс: ${freeAmount} | Цена: ${ticker.last}`);

        // Проверяем открытые ордера
        const openOrders = await this.exchange.fetchOpenOrders(symbol);
        const hasSellOrder = openOrders.some(o => o.side === 'sell');

        if (hasSellOrder) {
          console.log(`ℹ️ Уже есть SELL ордер для ${symbol}`);
          continue;
        }

        const rawSellPrice = ticker.last * 1.02; // Ставим +2% от цены

        const validated = await this.canPlaceSellOrder(
          symbol,
          freeAmount,
          rawSellPrice
        );

        if (!validated) continue;

        console.log(`🚀 Создаю SELL ордер ${symbol}: ${validated.amount} по ${validated.price}`);
        
        // РАЗКОММЕНТИРОВАТЬ для реальной торговли:
        /*
        await this.exchange.createLimitSellOrder(
          symbol,
          validated.amount,
          validated.price
        );
        */
      } catch (err) {
        console.error(`❌ Ошибка по паре ${symbol}:`, err.message);
      }
    }
  }
}

// --- БОТ ---
const trader = new BybitTradingEngine();



// Нажатие на "Торговля"
bybitModule.callbackQuery("start_analysis", async (ctx) => {
  const getProfile = trader.getSignature();
  // await ctx.answerCallbackQuery();
  await ctx.reply("Начинаю анализ стратегии через n8n...");
  // Здесь должен быть вызов axios.post к вашему n8n Webhook
  try {
    await fetch('https://generatesora2youtube-xdmen.amvera.io/webhook-test/grammy-trading-bot', {
        method: 'POST', // 1. Указываем метод
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'endpoits':{
            'historyOrders':"/v5/execution/list",
            'profile_wallet':"/v5/account/wallet-balance"
          },
            'api-secret': (await getProfile).secret,
            'X-BAPI-API-KEY': (await getProfile).api,
            'X-BAPI-SIGN': (await getProfile).signature,
            'X-BAPI-TIMESTAMP': (await getProfile).timestamp,
            'X-BAPI-RECV-WINDOW': (await getProfile).recvWindow
        })
    })
  } catch (e) {
    console.error("Ошибка n8n:", e.message);
  }
});

// Нажатие на "Давай" (прилетает из n8n)
bybitModule.callbackQuery(/^start_trade_(.+)$/, async (ctx) => {
  const tableId = ctx.match[1];
  await ctx.answerCallbackQuery();
  await ctx.reply(`Запускаю торговлю. ID стратегии: ${tableId}`);

  try {
    await trader.init();
    await trader.runTradeLogic();
    await ctx.reply("Торговый цикл завершен.");
  } catch (error) {
    await ctx.reply("Произошла ошибка при торговле.");
    console.error(error);
  }
});

// bot.callbackQuery("start_analysis", {
//   ctx.reply('hello')
// })

