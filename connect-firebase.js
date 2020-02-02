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

function getAllEvents() {
  return getEventsByKeyword("");
}

function getEventsByKeyword(keyword) {
  return ref.once("value").then(snapshot => {
    let events = [];
    snapshot.forEach(eventObj => {
      let event = eventObj.val();
      if (event.Name.toLowerCase().includes(keyword))
        events.push(event);
    });
    return events;
  });
}

function getEventsByTag(tag, callback) {
  return ref.once("value").then(snapshot => {
    let events = [];
    snapshot.forEach(eventObj => {
      const event = eventObj.val();
      if(event.Tags.any(eventTag => eventTag === tag)) {
        events.push()
      }
    });
    return events;
  });
}

function getEventsByDates(startingStart, endingStart) {
  return ref
    .orderByChild("Start Date")
    .startAt(startingStart)
    .endAt(endingStart)
    .once("value")
    .then(snapshot => {
      let events = [];
      snapshot.forEach(eventObj => {
        events.push(eventObj.val());
      });
      return events;
    });
}

function getEventsByDay(day) {
  return ref
    .orderByChild("Day")
    .equalTo(day)
    .once("value")
    .then(snapshot => {
      let events = [];
      snapshot.forEach(eventObj => {
        const event = eventObj.val();
        events.push(event);
      });
      return events;
    });
}

module.exports = {
  getAllEvents,
  getEventsByKeyword,
  getEventsByTag,
  getEventsByDates,
  getEventsByDay
};
