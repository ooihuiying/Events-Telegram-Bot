require("dotenv").config({ path: __dirname + "/.env" });

// Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const TelegramBot = require("node-telegram-bot-api");
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const firebase = require("firebase");
const moment = require("moment");

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
const refOneTime = firebase.database().ref("One-Time");
const refWeekly = firebase.database().ref("Weekly");
const ref = firebase.database().ref("Events");
// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", msg => {
  const chatId = msg.chat.id;
  // send a message to the chat acknowledging receipt of their message
  if (msg.text !== "/OneTime" && msg.text !== "/Weekly") {
    bot.sendMessage(
      chatId,
      "Hi, Type\n /OneTime to get the list of one-time events that is happening!\n /Weekly to get the list of weekly events"
    );
  }
});

bot.onText(/\/onetime/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome", {
    reply_markup: {
      one_time_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "Today",
            callback_data: "Today"
          }
        ],
        [
          {
            text: "7 Days",
            callback_data: "7 Days"
          }
        ],
        [
          {
            text: "14 Days",
            callback_data: "14 Days"
          }
        ]
      ]
    }
  });
});

bot.onText(/\/weekly/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome", {
    reply_markup: {
      one_time_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "Monday",
            callback_data: "Monday"
          }
        ],
        [
          {
            text: "Tuesday",
            callback_data: "Tuesday"
          }
        ],
        [
          {
            text: "Wednesday",
            callback_data: "Wednesday"
          }
        ],
        [
          {
            text: "Thursday",
            callback_data: "Thursday"
          }
        ],
        [
          {
            text: "Friday",
            callback_data: "Friday"
          }
        ],
        [
          {
            text: "Saturday",
            callback_data: "Saturday"
          }
        ],
        [
          {
            text: "Sunday",
            callback_data: "Sunday"
          }
        ]
      ]
    }
  });
});

bot.on("callback_query", response => {
  const data = response.data;
  bot.sendMessage(response.message.chat.id, "You selected " + data);

  const startingStart = moment(new Date()).format("YYYY-MM-DD");
  let endingStart;
  let isWeekly = false;
  if (data == "Today") {
    endingStart = startingStart;
  } else if (data == "7 Days") {
    endingStart = moment()
      .add(7, "days")
      .format("YYYY-MM-DD");
  } else if (data === "14 Days") {
    endingStart = moment()
      .add(14, "days")
      .format("YYYY-MM-DD");
  } else {
    // Case of searching by Day for weekly events
    isWeekly = true;
  }

  let displayText = "***************<pre>\n</pre>";
  if (isWeekly == false) {
    ref
      .orderByChild("Start Date")
      .startAt(startingStart)
      .endAt(endingStart)
      .once("value")
      .then(snapshot => {
        snapshot.forEach(eventObj => {
          displayText +=
            "<b>Name: </b>" +
            eventObj.val().Name +
            "<pre>\n</pre><b>Start Time: </b>" +
            eventObj.val()["Start Time"] +
            "<pre>\n</pre><b>Start Date: </b>" +
            eventObj.val()["Start Date"] +
            "<pre>\n</pre><b>End Time: </b>" +
            eventObj.val()["End Time"] +
            "<pre>\n</pre><b>End Date: </b>" +
            eventObj.val()["End Date"] +
            "<pre>\n</pre><b>Venue: </b>" +
            eventObj.val().Venue +
            "<pre>\n</pre><b>Description: </b>" +
            eventObj.val().Description;

          bot.sendMessage(response.message.chat.id, displayText, {
            parse_mode: "HTML"
          });
        });
      });
  } else if (isWeekly == true) {
    ref
      .orderByChild("Day")
      .equalTo(data)
      .once("value")
      .then(snapshot => {
        snapshot.forEach(eventObj => {
          displayText +=
            "<b>Name: </b>" +
            eventObj.val().Name +
            "<pre>\n</pre><b>Start Time: </b>" +
            eventObj.val()["Start Time"] +
            "<pre>\n</pre><b>End Time: </b>" +
            eventObj.val()["End Time"] +
            "<pre>\n</pre><b>Day: </b>" +
            eventObj.val()["Day"] +
            "<pre>\n</pre><b>Venue: </b>" +
            eventObj.val().Venue +
            "<pre>\n</pre><b>Description: </b>" +
            eventObj.val().Description;
          bot.sendMessage(response.message.chat.id, displayText, {
            parse_mode: "HTML"
          });
        });
      });
  }
});

// To push data into firebase
// const toDeleteData = {
//     Name: "Yoga",
//     Tags: ["Fun", "Yoga"],
//     Day: "Monday",
//     "Start Time": "7pm",
//     "End Time": "9pm",
//     Venue: "RVRC Flex Room",
//     Description: "Yoga!"
//   };
//   refWeekly.push(toDeleteData);
