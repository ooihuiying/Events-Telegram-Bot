const firebase = require("firebase");
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

const {
  craftDisplayWeeklyMessage,
  craftDisplayOneTimeMessage
} = require("./craftDisplayMessages");

async function getAllEvents(keyword, callback) {
  await ref.once("value").then(snapshot => {
    let replies = [];
    snapshot.forEach(eventObj => {
      const value = eventObj.val();
      if (
        !keyword ||
        (keyword && value.Name.toLowerCase().includes(keyword.toLowerCase()))
      ) {
        if (value.Day == undefined) {
          replies.push(craftDisplayOneTimeMessage(value));
        } else {
          replies.push(craftDisplayWeeklyMessage(value));
        }
      }
    });
    callback(replies);
  });
}

async function getTagEvents(keyword, callback) {
  await ref.once("value").then(snapshot => {
    let replies = [];
    snapshot.forEach(eventObj => {
      const value = eventObj.val();
      let exit = true;
      value["Tags"].forEach(elm => {
        if (elm.toLowerCase().includes(keyword.toLowerCase())) {
          exit = false;
        }
      });
      if (exit === true) return;
      if (value.Day == undefined) {
        replies.push(craftDisplayOneTimeMessage(value));
      } else {
        replies.push(craftDisplayWeeklyMessage(value));
      }
    });
    callback(replies);
  });
}

async function getEventsByDates(startingStart, endingStart, callback) {
  ref
    .orderByChild("Start Date")
    .startAt(startingStart)
    .endAt(endingStart)
    .once("value")
    .then(snapshot => {
      let replies = [];
      snapshot.forEach(eventObj => {
        const value = eventObj.val();
        replies.push(craftDisplayOneTimeMessage(value));
      });
      callback(replies);
    });
}

async function getEventsByDay(day, callback) {
  ref
    .orderByChild("Day")
    .equalTo(day)
    .once("value")
    .then(snapshot => {
      let replies = [];
      snapshot.forEach(eventObj => {
        const value = eventObj.val();
        replies.push(craftDisplayWeeklyMessage(value));
      });
      callback(replies);
    });
}
module.exports.getAllEvents = getAllEvents;
module.exports.getTagEvents = getTagEvents;
module.exports.getEventsByDates = getEventsByDates;
module.exports.getEventsByDay = getEventsByDay;
