require("dotenv").config({ path: __dirname + "/.env" });

// Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const TelegramBot = require("node-telegram-bot-api");
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const moment = require("moment");

const {
  WELCOME,
  SEARCH_NAME_SYNTAX,
  SEARCH_TAG_SYNTAX,
  END_OF_QUERY
} = require("./displayMessagesConstants");

const {
  getAllEvents,
  getEventsByKeyword,
  getEventsByTag,
  getEventsByDates,
  getEventsByDay
} = require("./connect-firebase");

function replyWithEvents(chatId, events) {
  if (events.length) {
    let combinedMessage = events.reduce((acc, event) => acc + event.toString() + "\n\n", "");
    bot.sendMessage(chatId, combinedMessage, {
      parse_mode: "HTML"
    });

  } else {
    bot.sendMessage(chatId, END_OF_QUERY, {
      parse_mode: "HTML"
    });
  }
}

// Listen for any kind of message.
bot.on("message", msg => {
  const chatId = msg.chat.id;
  // send a message to the chat acknowledging receipt of their message
  if (!msg.entities) {
    bot.sendMessage(chatId, WELCOME);
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
  getAllEvents().then(events => replyWithEvents(msg.chat.id, events));
});

bot.onText(/\/searchname/, (msg, match) => {
  const keyword = match.input.replace("/searchname", "").trim();

  if (!keyword) {
    bot.sendMessage(msg.chat.id, SEARCH_NAME_SYNTAX, {
      parse_mode: "HTML"
    });
    return;
  }
  getEventsByKeyword(keyword)
    .then(events => replyWithEvents(msg.chat.id, events));
});

bot.onText(/\/searchtag/, (msg, match) => {
  const keyword = match.input.replace("/searchtag", "").trim();
  if (!keyword) {
    bot.sendMessage(msg.chat.id, SEARCH_TAG_SYNTAX, {
      parse_mode: "HTML"
    });
    return;
  }
  getEventsByTag(keyword)
    .then(events => replyWithEvents(msg.chat.id, events));
});

bot.on("callback_query", response => {
  const data = response.data;
  bot.sendMessage(response.message.chat.id, "You selected " + data);

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
  if (isWeekly === false) {
    getEventsByDates(startingStart, endingStart)
      .then(events => replyWithEvents(response.message.chat.id, events));
  } else if (isWeekly === true) {
    getEventsByDay(data)
      .then(events => replyWithEvents(response.message.chat.id, events));
  }
});
