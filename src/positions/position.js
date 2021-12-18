export class Position {
    constructor (
        counterAsset,
        baseAsset,
        price,
        amount,
        createdAt = new Date(),
    ) {
        this.counterAsset = counterAsset;
        this.baseAsset = baseAsset;
        this.amount = amount;
        this.openPrice = price;
        this.closePrice = undefined;
        this.createdAt = createdAt;
        this.closedAt = undefined;
    }

    get isOpen() {
        return !this.closedAt;
    }

    getProfitLoss(closePrice) {
        if (this.isOpen) {
            return (closePrice / this.openPrice) - 1;
        }
        return (this.closePrice / this.openPrice) - 1;
    }

    getProfitLossAmount(closePrice) {
        if (this.isOpen) {
            return this.amount * (closePrice - this.openPrice);
        }
        return this.amount * (this.closePrice - this.openPrice);
    }

    close(closePrice, closedAt = new Date()) {
        if (!this.isOpen) {
            return {
                amount: 0,
            }
        }
        this.closePrice = closePrice;
        this.closedAt = closedAt;
        return {
            amount: this.amount * closePrice,
        }
    }
}