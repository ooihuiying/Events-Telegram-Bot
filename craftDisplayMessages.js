const {
  DISPLAY_TEXT_ONE_TIME,
  DISPLAY_TEXT_WEEKLY
} = require("./displayMessagesConstants");

function craftDisplayOneTimeMessage(value) {
  return DISPLAY_TEXT_ONE_TIME.replace("{NAME}", value.Name)
    .replace("{START TIME}", value["Start Time"])
    .replace("{START DATE}", value["Start Date"])
    .replace("{END TIME}", value["End Time"])
    .replace("{END DATE}", value["End Date"])
    .replace("{VENUE}", value.Venue)
    .replace("{DESCRIPTION}", value.Description);
}

function craftDisplayWeeklyMessage(value) {
  return DISPLAY_TEXT_WEEKLY.replace("{NAME}", value.Name)
    .replace("{START TIME}", value["Start Time"])
    .replace("{END TIME}", value["End Time"])
    .replace("{DAY}", value["Day"])
    .replace("{VENUE}", value.Venue)
    .replace("{DESCRIPTION}", value.Description);
}

module.exports.craftDisplayOneTimeMessage = craftDisplayOneTimeMessage;
module.exports.craftDisplayWeeklyMessage = craftDisplayWeeklyMessage;
