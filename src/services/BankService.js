const Database = require('./Database');

class BankService {
  constructor(authService) {
    this.db = new Database();
    this.authService = authService;
  }

  async checkBalance() {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const accountData = await this.db.get(
      'SELECT balance FROM accounts WHERE id = ?',
      [user.accountId]
    );
    return accountData.balance;
  }

  async deposit(amount) {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Пользователь не авторизован');

    if (amount <= 0) throw new Error('Сумма должна быть положительной');

    await this.db.run(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, user.accountId]
    );

    const newBalance = await this.checkBalance();
    return newBalance;
  }

  async withdraw(amount) {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Пользователь не авторизован');

    if (amount <= 0) throw new Error('Сумма должна быть положительной');

    const currentBalance = await this.checkBalance();
    if (currentBalance < amount) {
      throw new Error('Недостаточно средств');
    }

    await this.db.run(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, user.accountId]
    );

    const newBalance = await this.checkBalance();
    return newBalance;
  }
}

module.exports = BankService;