javascript
class Account {
  constructor(id, balance = 0) {
    this.id = id;
    this.balance = balance;
  }
}

module.exports = Account;