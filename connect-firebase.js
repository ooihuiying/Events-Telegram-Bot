const Event = require("./event");
const firebase = require("firebase-admin");
const User = require("./user");

const firebaseAdminSDK = {
  type: "service_account",
  project_id: "rvrc-events-bot",
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: "101927109479737139744",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
};

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "rvrc-events-bot.firebaseapp.com",
  databaseURL: "https://rvrc-events-bot.firebaseio.com",
  projectId: "rvrc-events-bot",
  storageBucket: "rvrc-events-bot.appspot.com",
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_API_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  credential: firebase.credential.cert(firebaseAdminSDK)
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
        let key = "NO KEY";
        snapshot.forEach(eventObj => {
          key = eventObj.key;
        });
        return key;
      })
      .catch(e => {
        console.log(e);
      });
  }

  putNewEvent(event) {
    const newEventRef = this._ref.push();
    let eventData = event.toJSON();
    eventData.published = false;
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

  setUserIsMutedAttribute(chatID, mute) {
    return this.getUserByChatID(chatID).then(existingKey => {
      if (existingKey !== "NO KEY") {
        this._ref
          .child(`${existingKey}`)
          .once("value")
          .then(snapshot => {
            return snapshot.val();
          })
          .then(value => {
            value.isMuted = mute;
            return this._ref.child(`${existingKey}`).update(value);
          });
      }
    });
  }

  getAllUsers(tagsToCheck) {
    return this._ref
      .once("value")
      .then(snapshot => {
        let matchingUsersTelegramID = [];
        snapshot.forEach(userObj => {
          let user = User.fromJSON(userObj.val());
          const userTagsHouse = user.tags.concat(user.house);
          // True if current user contains common tags, house with tagsToCheck
          const found = userTagsHouse.some(r => tagsToCheck.indexOf(r) >= 0);
          if (found && user.isMuted == "No")
            matchingUsersTelegramID.push(user.telegramID);
        });
        return matchingUsersTelegramID;
      })
      .catch(console.error);
  }

  // Using callback here instead of Promise because
  // on() method does not return a promise object...?
  // https://firebase.google.com/docs/reference/js/firebase.database.Query#on
  updateUserOfNewEvents(callback) {
    return this._ref
      .orderByChild("published")
      .equalTo(false)
      .on("child_added", snapshot => {
        const eventFBKey = snapshot.key;
        const event = snapshot.val();
        const post = Event.fromJSON(event);
        // Set published attribute of Event to be True
        // This published attribute has not been set to be part of
        // Event object...
        event.published = true;
        this._ref.child(`${eventFBKey}`).update(event);
        return callback(post);
      });
  }

  updateEvent(event, key) {}
}

module.exports = FirebaseWrapper;
