const User = require("./user");

let i = 0;
TRAITS = {
  Idle: i++,
  TelegramID: i++,
  Edit: i++,
  Create: i++,
  Name: i++,
  House: i++,
  Tags: i++,
  IsMuted: i++,
  Permissions: i++,
  Final: i++
};

class UserBuilder {
  constructor(traits = TRAITS.Idle) {
    this.traits = traits;
  }

  static edit(User) {
    const UserBuilder = new UserBuilder(TRAITS.Edit);
    UserBuilder.fromObject(User);
    return UserBuilder;
  }

  fromObject(User) {
    this.name = User.name;
    this.TelegramID = User.TelegramID;
    this.house = User.house;
    this.tags = User.tags;
    this.isMuted = User.isMuted;
    this.permissions = User.permissions;
  }

  accept(value) {
    switch (this.traits) {
      case TRAITS.Name:
        this.name = value;
        this.traits = TRAITS.House;
        break;
      case TRAITS.House:
        this.house = value;
        this.traits = TRAITS.Tags;
        break;
      case TRAITS.Tags:
        this.tags = value.split(", ");
        this.traits = TRAITS.IsMuted;
        break;
      case TRAITS.IsMuted:
        this.isMuted = value;
        this.traits = TRAITS.Final;
        break;
      //   case TRAITS.TelegramID:
      //     this.telegramID = value;
      //     // this.traits = TRAITS.Permissions;
      //     break;
      //   case TRAITS.Permissions:
      //     this.permissions = value;
      //     // this.traits = TRAITS.Final;
      //     break;
      default:
        throw new Error(`traits does not accept values: ${this.traits}`);
    }
  }

  gettraits() {
    return this.traits;
  }

  settraits(traits) {
    if (traits in TRAITS) {
      this.traits = TRAITS[traits];
    } else {
      this.traits = traits;
    }
  }

  setTelegramIDAndPermissions(id, permissions) {
    this.telegramID = id;
    this.permissions = permissions;
  }

  finalize() {
    return new User(
      this.name,
      this.telegramID,
      this.house,
      this.tags,
      this.isMuted,
      this.permissions
    );
  }
}

module.exports = {
  UserBuilder,
  TRAITS
};
