const BankService = require('./BankService');

class ATMService extends BankService {
  constructor(authService) {
    super(authService);
  }

  // В банкомате можно только снимать деньги
  async withdraw(amount) {
    return await super.withdraw(amount);
  }

  // В банкомате нельзя пополнять счет
  deposit() {
    throw new Error('Пополнение счета недоступно в банкомате');
  }
}

module.exports = ATMService;