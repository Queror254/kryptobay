const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('7027648574:AAEHSYBOx593F00vYjbWEP2ab3D1-iRh7SA');

// Map to store user-specific state
const userState = new Map();

// Start command: Send a message with an inline button
bot.start((ctx) => {
  ctx.reply('Welcome! Click the button below to go to the menu.', 
    Markup.inlineKeyboard([
      Markup.button.callback('Go to Menu', 'menu')
      
    ])
  );
});

//menu 
bot.action('menu', (ctx) => {
      ctx.reply('Buy, send and exchange crypto easily, securely and conveniently',
    Markup.inlineKeyboard([
        //first row
      [Markup.button.callback('Buy', 'buy'),
      Markup.button.callback('Sell', 'get_crypto_data')],

        //second row
      [Markup.button.callback('Get Crypto Data', 'get_crypto_data')],
      [Markup.button.callback('Sell Crypto Data', 'get_crypto_data')],
    ])
);
});

// Handle the /menu command to send an inline button
bot.command('menu', (ctx) => {
  ctx.reply('Buy, send and exchange crypto easily, securely and conveniently',
    Markup.inlineKeyboard([
        //first row
      [Markup.button.callback('Buy', 'get_crypto_data'),
      Markup.button.callback('Sell', 'get_crypto_data')],

        //second row
      [Markup.button.callback('Get Crypto Data', 'get_crypto_data')],
      [Markup.button.callback('Sell Crypto Data', 'get_crypto_data')],
    ]),
  );
});

//buy action
bot.action('buy', (ctx) => {
      ctx.reply('Below is a list of crypto that are available for exchange :',
    Markup.inlineKeyboard([
        //first row
      [Markup.button.callback('BTC', 'calculate_price_BTC'),
      Markup.button.callback('ETH', 'calculate_price_ETH')],

        //second row
      [Markup.button.callback('BNB', 'calculate_price_BNB')],
      [Markup.button.callback('USDT', 'calculate_price_USDT')],
    ])
);
});

// Handle the callback query from the button
bot.action('get_crypto_data', async (ctx) => {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=5', {
      headers: {
        'X-CMC_PRO_API_KEY': '2bf3c5b5-f7d2-420f-9350-551eb666e983',
      },
    });

    if (response && response.data && response.data.data) {
      const cryptos = response.data.data.slice(0, 5);

      // Send data for each cryptocurrency
      cryptos.forEach(async (crypto, index) => {
        const message = `
          *${index + 1}:* *${crypto.name}*
          *Symbol:* ${crypto.symbol}
          *Rank:* ${crypto.cmc_rank}
          *Price (USD):* $${crypto.quote.USD.price.toFixed(2)}
          *24h Change:* ${crypto.quote.USD.percent_change_24h}%
          *Circulating Supply:* ${crypto.circulating_supply}
          *Total Supply:* ${crypto.total_supply}
          *Last Updated:* ${crypto.last_updated}
        `;

        await ctx.replyWithMarkdown(message, Markup.inlineKeyboard([
          Markup.button.url('More Info', `https://coinmarketcap.com/currencies/${crypto.slug}`)
        ]));
      });

    } else {
      await ctx.reply('Sorry, I could not retrieve the data.');
    }

  } catch (error) {
    console.error(error);
    await ctx.reply('An error occurred while fetching the data.');
  }
});

//price calculator
// Generalized action to handle all crypto price calculations
bot.action(/calculate_price_(.+)/, (ctx) => {
  const symbol = ctx.match[1];  // Extract the symbol from the callback data
  userState.set(ctx.from.id, { symbol }); // Store the symbol in the map
  ctx.reply(`How much ${symbol} would you like to buy?`);
});

// Handle text messages to calculate price
bot.on('text', async (ctx) => {
  const state = userState.get(ctx.from.id);
  
  if (state && state.symbol) {
    const amount = parseFloat(ctx.message.text);
    const symbol = state.symbol;
    const kesExchangeRate = 146.50; // Example exchange rate USD to KES

    userState.delete(ctx.from.id); // Remove user state after processing

    if (isNaN(amount) || amount <= 0) {
      return ctx.reply('Please enter a valid number.');
    }

    try {
      const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
        headers: {
          'X-CMC_PRO_API_KEY': '2bf3c5b5-f7d2-420f-9350-551eb666e983',
        },
      });

      if (response && response.data && response.data.data && response.data.data[symbol]) {
        const cryptoPriceUsd = response.data.data[symbol].quote.USD.price;
        const totalCostKes = cryptoPriceUsd * kesExchangeRate * amount;

        await ctx.reply(`The price of ${amount} ${symbol} in KES is approximately KES ${totalCostKes.toFixed(2)}.`, 
         Markup.inlineKeyboard([
          [Markup.button.callback('Continue', 'get_address'), Markup.button.callback('Go back', 'buy')]
         ])
      );
      } else {
        await ctx.reply('Sorry, I could not retrieve the data.');
      }

    } catch (error) {
      console.error(error);
      await ctx.reply('An error occurred while fetching the data.');
    }
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
