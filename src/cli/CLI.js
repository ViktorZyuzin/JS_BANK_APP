const readlineSync = require('readline-sync');
const AuthService = require('../services/AuthService');
const BankService = require('../services/BankService');
const ATMService = require('../services/ATMService');

class CLI {
  constructor() {
    this.authService = new AuthService();
    this.bankService = null;
    this.atmService = null;
  }

  start() {
    console.log('=== Банковская система ===');
    this.showMainMenu();
  }

  showMainMenu() {
    while (true) {
      console.log('\n--- Главное меню ---');
      console.log('1 - Войти в Банкомат');
      console.log('2 - Войти в Банк');
      console.log('0 - Выйти');

      const choice = readlineSync.question('Выберите опцию: ');

      switch (choice) {
        case '1':
          this.atmAuth();
          break;
        case '2':
          this.bankMenu();
          break;
        case '0':
          console.log('До свидания!');
          return;
        default:
          console.log('Неверный выбор. Попробуйте снова.');
      }
    }
  }

  async atmAuth() {
    console.log('\n--- Авторизация в банкомате ---');
    const login = readlineSync.question('Логин: ');
    const pin = readlineSync.question('Пин-код: ', { hideEchoBack: true });

    const success = await this.authService.authenticate(login, pin);
    if (success) {
      this.atmService = new ATMService(this.authService);
      this.atmMenu();
    } else {
      console.log('Неверный логин или пин-код');
    }
  }

  atmMenu() {
    while (this.authService.getCurrentUser()) {
      console.log('\n--- Меню банкомата ---');
      console.log('1 - Проверить баланс');
      console.log('2 - Снять деньги');
      console.log('0 - Вернуться в начало');

      const choice = readlineSync.question('Выберите опцию: ');

      switch (choice) {
        case '1':
          this.checkBalance();
          break;
        case '2':
          this.withdrawMoney();
          break;
        case '0':
          this.authService.logout();
          this.atmService = null;
          return;
        default:
          console.log('Неверный выбор. Попробуйте снова.');
      }
    }
  }

  bankMenu() {
    while (true) {
      console.log('\n--- Меню банка ---');
      console.log('1 - Добавить пользователя');
      console.log('2 - Авторизоваться');
      console.log('0 - Вернуться в начало');

      const choice = readlineSync.question('Выберите опцию: ');

      switch (choice) {
        case '1':
          this.registerUser();
          break;
        case '2':
          this.bankAuth();
          break;
        case '0':
          return;
        default:
          console.log('Неверный выбор. Попробуйте снова.');
      }
    }
  }

  async registerUser() {
    console.log('\n--- Регистрация пользователя ---');
    const login = readlineSync.question('Логин: ');
    const name = readlineSync.question('Имя: ');
    const pin = readlineSync.question('Пин-код (4 цифры): ', { hideEchoBack: true });

    if (!/^\d{4}$/.test(pin)) {
      console.log('Пин-код должен состоять из 4 цифр');
      return;
    }

    const success = await this.authService.register(login, name, pin);
    if (success) {
      console.log('Пользователь успешно зарегистрирован');
    } else {
      console.log('Ошибка регистрации. Возможно, логин уже занят.');
    }
  }

  async bankAuth() {
    console.log('\n--- Авторизация в банке ---');
    const login = readlineSync.question('Логин: ');
    const pin = readlineSync.question('Пин-код: ', { hideEchoBack: true });

    const success = await this.authService.authenticate(login, pin);
    if (success) {
      this.bankService = new BankService(this.authService);
      this.bankOperationsMenu();
    } else {
      console.log('Неверный логин или пин-код');
    }
  }

  bankOperationsMenu() {
    while (this.authService.getCurrentUser()) {
      console.log('\n--- Операции банка ---');
      console.log('1 - Проверить баланс');
      console.log('2 - Добавить денег');
      console.log('3 - Снять денег');
      console.log('0 - Вернуться в начало');

      const choice = readlineSync.question('Выберите опцию: ');

      switch (choice) {
        case '1':
          this.checkBalance();
          break;
        case '2':
          this.depositMoney();
          break;
        case '3':
          this.withdrawMoney();
          break;
        case '0':
          this.authService.logout();
          this.bankService = null;
          return;
        default:
          console.log('Неверный выбор. Попробуйте снова.');
      }
    }
  }

  async checkBalance() {
    try {
      let balance;
      if (this.atmService) {
        balance = await this.atmService.checkBalance();
      } else if (this.bankService) {
        balance = await this.bankService.checkBalance();
      } else {
        console.log('Сервис не доступен');
        return;
      }
      console.log(`Ваш баланс: ${balance}`);
    } catch (error) {
      console.log(`Ошибка: ${error.message}`);
    }
  }

  async depositMoney() {
    if (!this.bankService) {
      console.log('Эта операция доступна только в банке');
      return;
    }

    try {
      const amount = parseFloat(readlineSync.question('Введите сумму для пополнения: '));
      if (isNaN(amount) || amount <= 0) {
        console.log('Неверная сумма');
        return;
      }

      const newBalance = await this.bankService.deposit(amount);
      console.log(`Операция успешна. Новый баланс: ${newBalance}`);
    } catch (error) {
      console.log(`Ошибка: ${error.message}`);
    }
  }

  async withdrawMoney() {
    try {
      const amount = parseFloat(readlineSync.question('Введите сумму для снятия: '));
      if (isNaN(amount) || amount <= 0) {
        console.log('Неверная сумма');
        return;
      }

      let newBalance;
      if (this.atmService) {
        newBalance = await this.atmService.withdraw(amount);
      } else if (this.bankService) {
        newBalance = await this.bankService.withdraw(amount);
      } else {
        console.log('Сервис не доступен');
        return;
      }

      console.log(`Операция успешна. Новый баланс: ${newBalance}`);
    } catch (error) {
      console.log(`Ошибка: ${error.message}`);
    }
  }
}

module.exports = CLI;