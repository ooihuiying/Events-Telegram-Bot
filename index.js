
require('dotenv').config({path: __dirname + '/.env'})

// Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN; 
const TelegramBot = require('node-telegram-bot-api');
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const firebase = require('firebase');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "rvrc-events-bot.firebaseapp.com",
    databaseURL: "https://rvrc-events-bot.firebaseio.com",
    projectId: "rvrc-events-bot",
    storageBucket: "rvrc-events-bot.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_API_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
firebase.initializeApp(firebaseConfig);

// Create 2 constansts, ref to hold the reference to the database
const ref = firebase.database().ref();

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
        const dayRequested = msg.text.toLowerCase()
        ref.orderByChild("day").on("value", (snapshot)=>{
            snapshot.forEach((eventObj)=>{
               if(eventObj.val().day.includes(dayRequested)){
                   bot.sendMessage(msg.chat.id, JSON.stringify(eventObj.val()));
               }
            })
        })

        
    });
  });


// To push data into firebase
//  const toDeleteData = {
//     name: 'event2',
//     day: 'monday',
//     time: '7pm',
//     details: 'Monday Runs'
// }
// ref.push(toDeleteData)