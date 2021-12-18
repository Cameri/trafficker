import R from 'ramda';
import { v4 as uuidv4 } from 'uuid';

import { PrimitiveBrain } from '../brains/primitive-brain.js';
import { Account } from '../accounts/account.js';
import { Actions } from '../types/actions.js';
import { Position } from "../positions/position.js";
import { DAY_TO_MILLISECONDS } from "../constants/time";
import { Asset } from "../assets.js";


const {
    clamp
} = R;

export class Trader {
    constructor (
        brain = new PrimitiveBrain(),
        accounts = [new Account(Asset.from('USDT'), 1000)]
    ) {
        this.id = uuidv4();
        this.brain = brain;
        this.accounts = accounts;
        this.lastAction = undefined;
        this.positions = [
            new Position(
                Asset.from('BTC'),
                Asset.from('USDT'),
                9376.0,
                0.01066486928,
            )
        ];
    }

    analyze(instrumentName, marketValues) {
        /*
        structure for

        structure for wallets:
        balance

        structure for instruments:
        last_order (% of balance)

        structure for coins:
        candle.high
        candle.open
        candle.close
        candle.low
        ma.50day
        ma.200day
        rsi.14day
        */

        const {
            close: closePrice,
            high,
            low,
            open,
        } = marketValues;

        const [counterAssetName, baseAssetName] = instrumentName.split('/');

        const balance = this.getBalance(baseAssetName);
        const positionBalance = this.getPositionCurrentBalance(counterAssetName, closePrice);
        const profitLoss = this.getPositionProfitLossAmount(counterAssetName, closePrice);
        const total = balance + positionBalance;

        const inputs = [
            balance / total,
            positionBalance / total,
            profitLoss / total,
        ];

        console.log('inputs', inputs);

        // const outputs = this.brain.predict(inputs);
        const outputs = [];

        const action = this.getActionFromOutputs(outputs);



    }

    getActionFromOutputs(outputs) {
        const [
            sell,
            buy,
            wait,
        ] = outputs;
        if (sell >= 0.5) {
            return {
                action: Actions.Sell,
                power: clamp(-1, 1, sell),
            };
        } else if (buy >= 0.5) {
            return {
                action: Actions.Buy,
                power: clamp(-1, 1, buy),
            }
        } else if (wait >= 0.5) {
            return {
                action: Actions.Wait,
                waitTime: DAY_TO_MILLISECONDS * Math.atanh(wait),
            }
        }

        return {
            action: Actions.None,
        }
    }

    withdrawFromAccount(asset, amount) {
        let withdrawn = 0;
        let toWithdraw = amount;
        for (const account in this.accounts.filter(({ asset: accountAsset }) => accountAsset === asset)) {
            withdrawn += account.withdraw(toWithdraw);
            toWithdraw -= withdrawn;
            if (toWithdraw <= 0) {
                break;
            }
        }

        return withdrawn;
    }

    depositToAccount(asset, amount) {
        const account = this.accounts.find((account) => account.asset === asset);
        if (account) {
            account.deposit(amount);
        }
    }

    getBalance(assetName) {
        return this.accounts.reduce((acc, account) =>
            account.asset === assetName
                ? acc + account.balance
                : acc,
            0,
        );
    }

    getPositionCurrentBalance(assetName, closePrice) {
        return this.positions.reduce((acc, position) =>
            position.isOpen && position.counterAssetName === assetName
                ? acc + position.amount * closePrice
                : acc,
            0,
        );
    }

    getPositionProfitLossAmount(asset, closePrice) {
        return this.positions.reduce((acc, position) =>
            position.isOpen && position.counterAssetName === asset
                ? acc + position.getProfitLossAmount(closePrice)
                : acc,
            0,
        );
    }
}
