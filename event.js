class Event {
  constructor(name, tags, start, end, venue, description, type) {
    this.name = name;
    this.tags = tags;
    this.start = start;
    this.end = end;
    this.venue = venue;
    this.description = description;
    this.type = type || "once"
  }

  static fromJSON(jsonObject) {
    return new Event(jsonObject.name, jsonObject.tags, jsonObject.start, jsonObject.end, jsonObject.venue, jsonObject.description, jsonObject.type);
  }

  print() {
    console.log(this.toString());
  }

  toString() {
    return `Event: ${this.name}\n` +
		`Tags: ${this.tags.join(", ")}\n` +
		`Start: ${this.start}\n` +
		`End: ${this.end}\n` +
		`Venue: ${this.venue}\n` +
		`Description: ${this.description}\n`;
  }

  toJSON() {
    return {
      "name": this.name,
      "tags": this.tags,
      "start": this.start,
      "end": this.end,
      "venue": this.venue,
      "description": this.description,
      "type": this.type
    };
  }
}

module.exports = Event;
