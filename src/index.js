import { Exchange } from './exchanges/local/local-exchange.js';
import { PassThrough, Writable } from 'stream';
import { Trader } from "./traders/trader.js";
import { Analyzer } from "./analyzer/analyzer.js";

const TRADER_COUNT = 1;
let traders = [];

const calculateFitness = () => {

}

const nextGeneration = () => {
    calculateFitness();
};

const resetTraders = () => {
    traders = [];
    let pending = TRADER_COUNT;
    while (pending--) {
        const trader = new Trader()

        traders.push(trader);
    }
    console.info(`Created ${traders.length} traders`);
};

const tradersThink = ({ instrumentName, data: marketValues }) => {
    console.log('got', instrumentName, marketValues)
    for (const trader of traders) {
        trader.analyze(instrumentName, marketValues);
    }
}


const exchangeStreamProcessor = new Writable({
    objectMode: true,
    write(chunks, encoding, callback) {
        if (!chunks) {
            callback()
            return;
        }

        for (const chunk of chunks) {
            tradersThink(chunk);
        }

        callback(null);
    }
})

const run = () => {
    const analyzer = new Analyzer();
    const exchange = new Exchange();

    resetTraders();

    exchange.pipe(analyzer);
    // exchange.on('data', (data) => {
    //     console.log(data);
    // });

    exchange.start();

};

run();
