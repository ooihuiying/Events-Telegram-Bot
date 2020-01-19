require('dotenv').config({path: __dirname + '/.env'})
// Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN; 
const TelegramBot = require('node-telegram-bot-api');
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // send a message to the chat acknowledging receipt of their message
    if(msg.text !== '/events'){
        bot.sendMessage(chatId, 'Hi, type /events to get the list of events that is happening!');
    }
  });

bot.onText(/\/events/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome!", {
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [["Monday"], ["Tuesday"], ["Wednesday"], ["Thursday"], ["Friday"], ["Saturday"], ["Sunday"]]
            }
        });
    // Connect to Firebase to retrieve today's events
    bot.onText(/.+/g, function(msg, match) {
        bot.sendMessage(msg.chat.id, "You selected " + match);
    });
  });
