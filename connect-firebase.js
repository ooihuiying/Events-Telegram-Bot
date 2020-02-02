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
const Event = require("./event")

const ref = firebase.database().ref("Events");

const {
  craftDisplayWeeklyMessage,
  craftDisplayOneTimeMessage
} = require("./craftDisplayMessages");
// TODO: Write wrapper class

function getAllEvents() {
  return getEventsByKeyword("");
}

function getEventsByKeyword(keyword) {
  return ref.once("value").then(snapshot => {
    let events = [];
    snapshot.forEach(eventObj => {
      let event = Event.fromJSON(eventObj.val());
      if (event.name.toLowerCase().includes(keyword))
        events.push(event);
    });
    return events;
  });
}

function getEventsByTag(tag, callback) {
  return ref.once("value").then(snapshot => {
    let events = [];
    snapshot.forEach(eventObj => {
      const event = Event.fromJSON(eventObj.val());
      if(event.tags.some(eventTag => eventTag === tag)) {
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
        events.push(Event.fromJSON(eventObj.val()));
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
        const event = Event.fromJSON(eventObj.val());
        events.push(event);
      });
      return events;
    });
}

function putNewEvent(event) {
  const newEventRef = ref.push();
  const eventData = event.toJSON();
  return newEventRef.set(eventData);
}

function updateEvent(event, key) {

}

module.exports = {
  getAllEvents,
  getEventsByKeyword,
  getEventsByTag,
  getEventsByDates,
  getEventsByDay,
  putNewEvent
};
