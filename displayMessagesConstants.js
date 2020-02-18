module.exports = {
  DISPLAY_TEXT_ONE_TIME:
    "☘<i>~One Time Event~</i>☘<pre>\n</pre>" +
    "<b>Name: </b> {NAME} <pre>\n</pre><b>Start Time: </b> {START TIME} <pre>\n</pre><b>Start Date: </b> {START DATE} <pre>\n</pre><b>End Time: </b> {END TIME} <pre>\n</pre><b>End Date: </b> {END DATE} <pre>\n</pre><b>Venue: </b> {VENUE} <pre>\n</pre><b>Description: </b> {DESCRIPTION}",
  DISPLAY_TEXT_WEEKLY:
    "🌓🌤<i>~Weekly~</i>🌤🌓<pre>\n</pre>" +
    "<b>Name: </b> {NAME} <pre>\n</pre><b>Start Time: </b> {START TIME} <pre>\n</pre><b>End Time: </b> {END TIME} <pre>\n</pre><b>Day: </b> {DAY} <pre>\n</pre><b>Venue: </b> {VENUE} <pre>\n</pre><b>Description: </b> {DESCRIPTION}",
  WELCOME: "Hi, Welcome to RVRC events bot. Try out our commands.",
  WELCOME_COMMANDS: {
    reply_markup: {
    one_time_keyboard: true,
      inline_keyboard: [
        [{
          text: "View All",
          callback_data: "command-view-all"
        }, {
          text: "Browse",
          callback_data: "command-browse"
        }]
  ]}},
  BROWSE_EVENTS_OPTIONS: {
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
  },
  SEARCH_NAME_SYNTAX: "Please add a keyword behind: /searchname keyword",
  SEARCH_TAG_SYNTAX: "Please add a keyword behind: /searchtag keyword",
  END_OF_QUERY: "🌅<i>~No Events Found!~</i>🌄"
};
