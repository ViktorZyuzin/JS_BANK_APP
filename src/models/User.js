class User {
    constructor(login, name, pin, balance = 0) {
        this.login = login;
        this.name = name;
        this.pin = pin;
        this.balance = balance;
    }

    validatePin(pin) {
        return this.pin === pin;
    }

    checkBalance() {
        return this.balance;
    }

    deposit(amount) {
        if (amount > 0) {
            this.balance += amount;
            return true;
        }
        return false;
    }

    withdraw(amount) {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
}

module.exports = User;