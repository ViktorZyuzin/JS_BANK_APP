const Database = require('./Database');
const User = require('../models/User');
const Account = require('../models/Account');

class AuthService {
  constructor() {
    this.db = new Database();
    this.currentUser = null;
  }

  async authenticate(login, pin) {
    try {
      const userData = await this.db.get(
        'SELECT u.*, a.balance FROM users u JOIN accounts a ON u.account_id = a.id WHERE u.login = ? AND u.pin = ?',
        [login, pin]
      );

      if (userData) {
        const account = new Account(userData.account_id, userData.balance);
        this.currentUser = new User(
          userData.id,
          userData.login,
          userData.name,
          userData.pin,
          account
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      return false;
    }
  }

  async register(login, name, pin) {
    try {
      // Проверяем, существует ли пользователь
      const existingUser = await this.db.get('SELECT id FROM users WHERE login = ?', [login]);
      if (existingUser) {
        return false; // Пользователь уже существует
      }

      // Создаем аккаунт
      const accountResult = await this.db.run('INSERT INTO accounts (balance) VALUES (0)');
      const accountId = accountResult.lastID;

      // Создаем пользователя
      await this.db.run(
        'INSERT INTO users (login, name, pin, account_id) VALUES (?, ?, ?, ?)',
        [login, name, pin, accountId]
      );

      return true;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return false;
    }
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

module.exports = AuthService;