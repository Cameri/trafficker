export class Account {

    constructor(asset, balance = 0) {
        this._asset = asset;
        this._balance = balance;
    }

    get balance() {
        return this._balance;
    }

    get asset() {
        return this._asset;
    }

    withdraw(amount) {
        const toWithdraw = Math.min(this.balance, amount);

        this._balance = Math.max(0, this.balance - toWithdraw);

        return toWithdraw;
    }

    deposit(amount) {
        this._balance += Math.abs(amount);

        return this._balance;
    }
}