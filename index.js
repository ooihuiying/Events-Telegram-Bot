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
const ref = firebase.database().ref("Events");

const DISPLAY_TEXT_ONE_TIME =
  "☘<i>~One Time Event~</i>☘<pre>\n</pre>" +
  "<b>Name: </b> {NAME} <pre>\n</pre><b>Start Time: </b> {START TIME} <pre>\n</pre><b>Start Date: </b> {START DATE} <pre>\n</pre><b>End Time: </b> {END TIME} <pre>\n</pre><b>End Date: </b> {END DATE} <pre>\n</pre><b>Venue: </b> {VENUE} <pre>\n</pre><b>Description: </b> {DESCRIPTION}";

const DISPLAY_TEXT_WEEKLY =
  "🌓🌤<i>~Weekly~</i>🌤🌓<pre>\n</pre>" +
  "<b>Name: </b> {NAME} <pre>\n</pre><b>Start Time: </b> {START TIME} <pre>\n</pre><b>End Time: </b> {END TIME} <pre>\n</pre><b>Day: </b> {DAY} <pre>\n</pre><b>Venue: </b> {VENUE} <pre>\n</pre><b>Description: </b> {DESCRIPTION}";

// Listen for any kind of message.
bot.on("message", msg => {
  const chatId = msg.chat.id;
  // send a message to the chat acknowledging receipt of their message
  if (!msg.entities) {
    bot.sendMessage(
      chatId,
      "Hi, Welcome to RVRC events bot. Try out our commands."
    );
  }
});

bot.onText(/\/events/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Select one", {
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
            text: "Last Week",
            callback_data: "Last Week"
          }
        ],
        [
          {
            text: "This Week",
            callback_data: "This Week"
          }
        ],
        [
          {
            text: "This Month",
            callback_data: "This Month"
          }
        ]
      ]
    }
  });
});

bot.onText(/\/weekly/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Select one", {
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

bot.onText(/\/allevents/, msg => {
  ref.once("value").then(snapshot => {
    snapshot.forEach(eventObj => {
      const value = eventObj.val();
      if (value.Day == undefined) {
        // One Time event
        const displayText = DISPLAY_TEXT_ONE_TIME.replace("{NAME}", value.Name)
          .replace("{START TIME}", value["Start Time"])
          .replace("{START DATE}", value["Start Date"])
          .replace("{END TIME}", value["End Time"])
          .replace("{END DATE}", value["End Date"])
          .replace("{VENUE}", value.Venue)
          .replace("{DESCRIPTION}", value.Description);
        bot.sendMessage(msg.chat.id, displayText, {
          parse_mode: "HTML"
        });
      } else {
        // Weekly event
        const displayText = DISPLAY_TEXT_WEEKLY.replace("{NAME}", value.Name)
          .replace("{START TIME}", value["Start Time"])
          .replace("{END TIME}", value["End Time"])
          .replace("{DAY}", value["Day"])
          .replace("{VENUE}", value.Venue)
          .replace("{DESCRIPTION}", value.Description);
        bot.sendMessage(msg.chat.id, displayText, {
          parse_mode: "HTML"
        });
      }
    });
  });
});

// Implement /search name XXX
// Implement /search category XXX

// Check out firebase indexOn
// Deploy

// Extension
// Description could change to link
// Subscribe to daily feed?
bot.onText(/\/search/, (msg, match) => {
  const chatId = msg.chat.id;
  console.log("match");
  console.log(match.input);

  // const keyword = match.input
  bot.sendMessage(
    chatId,
    "Type '/search name {keyword}' to search by name. Type /search category {keyword}"
  );
});

bot.on("callback_query", async response => {
  const data = response.data;
  await bot.sendMessage(response.message.chat.id, "You selected " + data);

  let startingStart;
  let endingStart;
  let isWeekly = false;
  if (data === "Today") {
    startingStart = moment(new Date()).format("YYYY-MM-DD");
    endingStart = startingStart;
  } else if (data === "This Week") {
    // Start of the week
    startingStart = moment()
      .weekday(0)
      .format("YYYY-MM-DD");
    // End of the week
    endingStart = moment()
      .weekday(7)
      .format("YYYY-MM-DD");
  } else if (data === "Last Week") {
    // Start of Last week
    startingStart = moment()
      .weekday(-7)
      .format("YYYY-MM-DD");
    // End of Last Week
    endingStart = moment()
      .weekday(0)
      .format("YYYY-MM-DD");
  } else if (data === "This Month") {
    startingStart = moment()
      .startOf("month")
      .format("YYYY-MM-DD");
    endingStart = moment()
      .endOf("month")
      .format("YYYY-MM-DD");
  } else {
    // Case of searching by Day for weekly events
    isWeekly = true;
  }

  // Start searching Firebase
  if (isWeekly == false) {
    await ref
      .orderByChild("Start Date")
      .startAt(startingStart)
      .endAt(endingStart)
      .once("value")
      .then(snapshot => {
        snapshot.forEach(eventObj => {
          const value = eventObj.val();
          const displayText = DISPLAY_TEXT_ONE_TIME.replace(
            "{NAME}",
            value.Name
          )
            .replace("{START TIME}", value["Start Time"])
            .replace("{START DATE}", value["Start Date"])
            .replace("{END TIME}", value["End Time"])
            .replace("{END DATE}", value["End Date"])
            .replace("{VENUE}", value.Venue)
            .replace("{DESCRIPTION}", value.Description);
          bot.sendMessage(response.message.chat.id, displayText, {
            parse_mode: "HTML"
          });
        });
      });
  } else if (isWeekly == true) {
    await ref
      .orderByChild("Day")
      .equalTo(data)
      .once("value")
      .then(snapshot => {
        snapshot.forEach(eventObj => {
          const value = eventObj.val();
          const displayText = DISPLAY_TEXT_WEEKLY.replace("{NAME}", value.Name)
            .replace("{START TIME}", value["Start Time"])
            .replace("{END TIME}", value["End Time"])
            .replace("{DAY}", value["Day"])
            .replace("{VENUE}", value.Venue)
            .replace("{DESCRIPTION}", value.Description);
          bot.sendMessage(response.message.chat.id, displayText, {
            parse_mode: "HTML"
          });
        });
      });
  }
  await bot.sendMessage(
    response.message.chat.id,
    "🌅<i>~No more Events!~</i>🌄",
    {
      parse_mode: "HTML"
    }
  );
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
