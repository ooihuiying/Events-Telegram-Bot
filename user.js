class User {
  constructor(name, telegramID, house, tags, isMuted, permissions) {
    this.name = name;
    this.telegramID = telegramID;
    this.house = house;
    this.tags = tags;
    this.isMuted = isMuted;
    this.permissions = permissions;
  }

  static fromJSON(jsonObject) {
    return new User(
      jsonObject.name,
      jsonObject.telegramID,
      jsonObject.house,
      jsonObject.tags,
      jsonObject.isMuted,
      jsonObject.permissions
    );
  }

  print() {
    console.log(this.toString());
  }

  toJSON() {
    return {
      name: this.name,
      telegramID: this.telegramID,
      house: this.house,
      tags: this.tags,
      isMuted: this.isMuted,
      permissions: this.permissions
    };
  }

  setKey(key) {
    this.key = key;
  }
}

module.exports = User;
