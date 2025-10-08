class User {
  constructor(id, login, name, pin, accountId) {
    this.id = id;
    this.login = login;
    this.name = name;
    this.pin = pin;
    this.accountId = accountId;
  }
}

module.exports = User;