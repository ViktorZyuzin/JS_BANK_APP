const readline = require('readline');
const AuthService = require('./services/AuthService');
const ATMService = require('./services/ATMService');
const BankService = require('./services/BankService');

class App {
    constructor() {
        this.authService = new AuthService();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('=== БАНКОВСКАЯ СИСТЕМА ===');
        
        while (true) {
            console.log('\n--- Главное меню ---');
            console.log('1 - Войти в Банкомат');
            console.log('2 - Войти в Банк');
            console.log('0 - Выйти');

            const choice = await this.question('Выберите опцию: ');

            switch (choice) {
                case '1':
                    const atmService = new ATMService(this.authService);
                    await atmService.start();
                    break;
                case '2':
                    const bankService = new BankService(this.authService);
                    await bankService.start();
                    break;
                case '0':
                    console.log('До свидания!');
                    this.rl.close();
                    return;
                default:
                    console.log('Неверный выбор!');
            }
        }
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// Запуск приложения
const app = new App();
app.start().catch(console.error);