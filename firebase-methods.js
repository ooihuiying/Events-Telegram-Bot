require('dotenv').config({path: __dirname + '/.env'})

// Telegram token you receive from @BotFather
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

// Create 2 constansts, _ref to hold the reference to the database
const ref = firebase.database().ref();

const events = firebase.database().ref("events");
const users = firebase.database().ref("users");

// console.log(_ref);

class Event {
  constructor(id, name, tags, start, end, venue, description) {
    this.id = id;
    this.name = name;
    this.tags = tags;
    this.start = start;
    this.end = end;
    this.venue = venue;
    this.description = description;
    this.key = "";
  }

  static fromJSON(jsonObject) {
    return new Event(jsonObject.id, jsonObject.name, jsonObject.tags, jsonObject.start, jsonObject.end, jsonObject.venue, jsonObject.description);
  }

  print() {
    console.log(`Event #${this.id}\n
		Name: ${this.name}\n
		Tags: ${this.tags}\n
		Start: ${this.start}\n
		End: ${this.end}\n
		Venue: ${this.venue}\n
		Description: ${this.description}`)
  }

  toJSON() {
    const jsonObject = {
      "id": this.id,
      "name": this.name,
      "tags": this.tags,
      "start": this.start,
      "end": this.end,
      "venue": this.venue,
      "description": this.description
    };

    return jsonObject;
  }

  setKey(key) {
    this.key = key;
  }
}

function getAll() {
  firebase.database().ref().once("value", snapshot => {
    snapshot.forEach(eventObj => {
      console.log(eventObj.val());
    });
  });
}

function getEvents() {
  return firebase.database().ref("events").once("value", snapshot => {
    snapshot.forEach(eventObj => {
      console.log(eventObj.key);
      console.log(eventObj.val());
    });
  }).catch(console.error);
}

function write(data) {
  firebase.database().ref().once("value", snapshot => {
    snapshot.forEach(eventObj => {
      console.log(eventObj.val());
    });
  });
}

getAll();
function updateEvent(event, key) {
  if (key) {
    event.key = key;
  }
  const newEventRef = firebase.database().ref().child(`events/${event.key}`);
  const eventData = event.toJSON();
  return newEventRef.set(eventData);
}

function newEvent(event) {
  const newEventRef = firebase.database().ref().child('events').push();
  event.id = newEventRef.key;
  const eventData = event.toJSON();
  return newEventRef.set(eventData);
}


function clearEvents() {
  firebase.database().ref().child('events').remove().catch(console.error).then(() => console.log("Cleared all events!"));
}

const event1 = new Event(1, "My Event", ["public", "rvrc", "food", "games"], "2020-01-28T12:28:57.793Z", "2020-01-28T15:28:57.793Z", "Dining Hall", "Come join our first event!");
const event2 = new Event(1, "My Second Event", ["public", "rvrc", "food", "games"], "2020-01-28T12:28:57.793Z", "2020-01-28T15:28:57.793Z", "MPR", "Come join our second event!");
// event1.print();
// newEvent(event2).then(() => {
// 	console.log("Written successfully!");
// }).catch(console.error);

updateEvent(event1, "-LzgDPWO-8G2q1ke8L6j");

// TODO: CRUD Interface
// TODO: Telegram Inline Keyboards

getEvents().then(() => console.log("Done!"));
// // getAll();
// clearEvents();
// getEvents();
// _ref.orderByChild("day").on("value", (snapshot)=>{
// snapshot.forEach((eventObj)=>{
// if(eventObj.val().day.includes(dayRequested)){
// bot.sendMessage(msg.chat.id, JSON.stringify(eventObj.val()));
// }
// })
// })
