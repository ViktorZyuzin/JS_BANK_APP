const readline = require('readline');

class BankService {
    constructor(authService) {
        this.authService = authService;
        this.currentUser = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        await this.showBankMenu();
    }

    async showBankMenu() {
        while (true) {
            console.log('\n=== БАНК ===');
            console.log('1 - Добавить пользователя');
            console.log('2 - Авторизоваться');
            console.log('0 - Выйти из приложения');

            const choice = await this.question('Выберите действие: ');

            switch (choice) {
                case '1':
                    await this.addUser();
                    break;
                case '2':
                    await this.authenticate();
                    break;
                case '0':
                    this.rl.close();
                    process.exit(0);
                default:
                    console.log('Неверный выбор!');
            }
        }
    }

    async addUser() {
        console.log('\n--- Добавление пользователя ---');
        
        const login = await this.question('Введите логин: ');
        
        if (this.authService.userExists(login)) {
            console.log('Пользователь с таким логином уже существует!');
            return;
        }

        const name = await this.question('Введите имя пользователя: ');
        const pin = await this.question('Введите PIN (4 цифры): ');

        if (pin.length !== 4 || !/^\d+$/.test(pin)) {
            console.log('PIN должен состоять из 4 цифр!');
            return;
        }

        if (this.authService.addUser(login, name, pin)) {
            console.log('Пользователь успешно добавлен!');
        } else {
            console.log('Ошибка при добавлении пользователя!');
        }
    }

    async authenticate() {
        console.log('\n--- Авторизация ---');
        
        const login = await this.question('Введите логин: ');
        const pin = await this.question('Введите PIN: ');

        this.currentUser = this.authService.authenticate(login, pin);
        
        if (!this.currentUser) {
            console.log('Неверный логин или PIN!');
            return;
        }

        console.log(`Добро пожаловать, ${this.currentUser.name}!`);
        await this.showUserMenu();
    }

    async showUserMenu() {
        while (true) {
            console.log('\n--- Меню пользователя ---');
            console.log('1 - Проверить баланс');
            console.log('2 - Добавить денег');
            console.log('3 - Снять денег');
            console.log('0 - Вернуться в начало');

            const choice = await this.question('Выберите действие: ');

            switch (choice) {
                case '1':
                    this.checkBalance();
                    break;
                case '2':
                    await this.depositMoney();
                    break;
                case '3':
                    await this.withdrawMoney();
                    break;
                case '0':
                    this.currentUser = null;
                    return;
                default:
                    console.log('Неверный выбор!');
            }
        }
    }

    checkBalance() {
        console.log(`Ваш баланс: ${this.currentUser.checkBalance()} руб.`);
    }

    async depositMoney() {
        const amount = parseInt(await this.question('Введите сумму для пополнения: '));
        
        if (isNaN(amount) || amount <= 0) {
            console.log('Неверная сумма!');
            return;
        }

        if (this.currentUser.deposit(amount)) {
            console.log(`Успешно пополнено на ${amount} руб.`);
            console.log(`Текущий баланс: ${this.currentUser.checkBalance()} руб.`);
        } else {
            console.log('Ошибка при пополнении счета!');
        }
    }

    async withdrawMoney() {
        const amount = parseInt(await this.question('Введите сумму для снятия: '));
        
        if (isNaN(amount) || amount <= 0) {
            console.log('Неверная сумма!');
            return;
        }

        if (this.currentUser.withdraw(amount)) {
            console.log(`Успешно снято ${amount} руб.`);
            console.log(`Остаток на счете: ${this.currentUser.checkBalance()} руб.`);
        } else {
            console.log('Недостаточно средств на счете!');
        }
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

module.exports = BankService;