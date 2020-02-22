const Event = require("./event");
const firebase = require("firebase");
const User = require("./user");

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

/**
 * Wrapper class to interface with firebase
 */
class FirebaseWrapper {
  constructor(path) {
    this._ref = firebase.database().ref(path);
  }

  static ref(path) {
    return new FirebaseWrapper(path);
  }

  getAllEvents() {
    return this.getEventsByKeyword("");
  }

  getEventsByKeyword(keyword) {
    return this._ref
      .once("value")
      .then(snapshot => {
        let events = [];
        snapshot.forEach(eventObj => {
          let event = Event.fromJSON(eventObj.val());
          event.setKey(eventObj.key);
          if (event.name.toLowerCase().includes(keyword)) events.push(event);
        });
        return events;
      })
      .catch(console.error);
  }

  getEventsByTag(tag) {
    return this._ref.once("value").then(snapshot => {
      let events = [];
      snapshot.forEach(eventObj => {
        const event = Event.fromJSON(eventObj.val());
        if (event.tags.some(eventTag => eventTag === tag)) {
          events.push(event);
        }
      });
      return events;
    });
  }

  getEventsByDates(startingStart, endingStart) {
    return this._ref
      .orderByChild("start")
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

  getEventsByDay(day) {
    return this._ref
      .orderByChild("day")
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

  getUserByChatID(chatID) {
    return this._ref
      .orderByChild("telegramID")
      .equalTo(chatID)
      .once("value")
      .then(snapshot => {
        let key = -1;
        snapshot.forEach(eventObj => {
          key = eventObj.key;
        });
        return key;
      });
  }

  putNewEvent(event) {
    const newEventRef = this._ref.push();
    const eventData = event.toJSON();
    return newEventRef.set(eventData);
  }

  // If user already exists in the fb, will do update instead
  putNewUser(user) {
    const newUserRef = this._ref.push();
    const userData = user.toJSON();
    return this.getUserByChatID(user.telegramID).then(existingKey => {
      if (existingKey) {
        return this._ref.child(`${existingKey}`).update(userData);
      } else return newUserRef.set(userData);
    });
  }

  updateEvent(event, key) {}
}

module.exports = FirebaseWrapper;
