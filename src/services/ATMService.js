const readline = require('readline');

class ATMService {
    constructor(authService) {
        this.authService = authService;
        this.currentUser = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('\n=== БАНКОМАТ ===');
        
        const login = await this.question('Введите логин: ');
        const pin = await this.question('Введите PIN (4 цифры): ');

        this.currentUser = this.authService.authenticate(login, pin);
        
        if (!this.currentUser) {
            console.log('Неверный логин или PIN!');
            this.rl.close();
            return false;
        }

        console.log(`Добро пожаловать, ${this.currentUser.name}!`);
        await this.showATMMenu();
        return true;
    }

    async showATMMenu() {
        while (true) {
            console.log('\n--- Меню Банкомата ---');
            console.log('1 - Проверить баланс');
            console.log('2 - Снять деньги');
            console.log('0 - Вернуться в начало');

            const choice = await this.question('Выберите действие: ');

            switch (choice) {
                case '1':
                    this.checkBalance();
                    break;
                case '2':
                    await this.withdrawMoney();
                    break;
                case '0':
                    this.rl.close();
                    return;
                default:
                    console.log('Неверный выбор!');
            }
        }
    }

    checkBalance() {
        console.log(`Ваш баланс: ${this.currentUser.checkBalance()} руб.`);
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

module.exports = ATMService;