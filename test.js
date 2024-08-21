const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local');

// Initialize the bot and session middleware
const bot = new Telegraf('7027648574:AAEHSYBOx593F00vYjbWEP2ab3D1-iRh7SA');
const session = new LocalSession({ database: 'user_sessions.json' });
bot.use(session.middleware());

// Start command: Send a message with an inline button
bot.start((ctx) => {
  ctx.session.userState = 'start'; // Set the initial state
  ctx.reply('Welcome! Choose an option below:', 
    Markup.inlineKeyboard([
      Markup.button.callback('Menu', 'menu')
    ])
  );
});

// Main Menu
bot.action('menu', (ctx) => {
  ctx.session.userState = 'menu'; // Update user state
  ctx.reply('This is the main menu. Choose an option:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Option 1', 'option1')],
      [Markup.button.callback('Option 2', 'option2')],
      [Markup.button.callback('Go Back', 'back')]
    ])
  );
});

// Option 1 Menu
bot.action('option1', (ctx) => {
  ctx.session.userState = 'option1'; // Update user state
  ctx.reply('You chose Option 1. Here you can choose to go back to the menu:',
    Markup.inlineKeyboard([
      Markup.button.callback('Go Back', 'back')
    ])
  );
});

// Option 2 Menu
bot.action('option2', (ctx) => {
  ctx.session.userState = 'option2'; // Update user state
  ctx.reply('You chose Option 2. Here you can choose to go back to the menu:',
    Markup.inlineKeyboard([
      Markup.button.callback('Go Back', 'back')
    ])
  );
});

// Go Back action
bot.action('back', (ctx) => {
  const userState = ctx.session.userState; // Get the current user state
  if (userState === 'menu' || userState === 'start') {
    ctx.reply('You are now back at the start. Choose an option below:',
      Markup.inlineKeyboard([
        Markup.button.callback('Menu', 'menu')
      ])
    );
  } else if (userState === 'option1' || userState === 'option2') {
    ctx.reply('Returning to the main menu...',
      Markup.inlineKeyboard([
        Markup.button.callback('Go Back', 'menu')
      ])
    );
  }
  // Reset the user state after going back
  ctx.session.userState = 'menu';
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
