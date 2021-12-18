import {
    Transform,
    PassThrough,
} from 'stream';

import R from 'ramda';
import fsR from 'fs-reverse';

import { Asset } from "../../assets/index.js";
import { Instrument } from '../../instruments/index.js';
import { zipStreams } from "../../utils/zip-streams.js";


const {
    cond,
    applySpec,
    pipe,
    split,
    nth,
    length,
    equals,
    always,
    T,
    mergeLeft,
} = R;

const DATA_PATH = './data';
const TIMESTAMP_START = 1580457660000;
const TIMESTAMP_END = 1636162500000;
const TIME_STEP = 60000;

const toString = (input) => input.toString();

export class Exchange extends PassThrough {
    constructor() {
        super({ objectMode: true });

        this.instruments = {
            // 'ADA/USDT': new Instrument(new Asset('ADA'), new Asset('USDT')),
            'BTC/USDT': new Instrument(new Asset('BTC'), new Asset('USDT')),
            //'DOT/USDT': new Instrument(new Asset('DOT'), new Asset('USDT')),
            // 'ETH/USDT': new Instrument(new Asset('ETH'), new Asset('USDT')),
            // 'SOL/USDT': new Instrument(new Asset('SOL'), new Asset('USDT')),
            // 'XLM/USDT': new Instrument(new Asset('XLM'), new Asset('USDT')),
        };
        this.passthrough = new PassThrough({
            objectMode: true,
        });

        this.streams = [];
    }

    start() {
        const streams = [];

        for (const instrumentName in this.instruments) {
            const filename = `${DATA_PATH}/Binance_${instrumentName.replace('/', '')}_minute.csv`;

            const stream = fsR(filename, { flags: 'r' })
                .pipe(new Transform({
                    objectMode: true,
                    transform(chunk, encoding, callback) {

                        if (!chunk.length) {
                            callback();
                            return;
                        }

                        const parse = applySpec({
                            timestamp: pipe(nth(0), Number),
                            date: pipe(nth(0), Number, (input) => new Date(input)),
                            counterAsset: pipe(nth(2), split('/'), nth(0), Asset.from),
                            baseAsset: pipe(nth(2), split('/'), nth(1), Asset.from),
                            open: pipe(nth(3), Number),
                            high: pipe(nth(4), Number),
                            low: pipe(nth(5), Number),
                            close: pipe(nth(6), Number),
                            // volumeA: pipe(nth(7), Number),
                            // volumeB: pipe(nth(8), Number),
                            // tradeCount: pipe(nth(9), Number),
                        })

                        const data = pipe(
                            toString,
                            split(','),
                            cond([
                                [
                                    pipe(length, equals(10)),
                                    pipe(
                                        parse,
                                        mergeLeft({
                                            instrumentName,
                                        })
                                    )
                                ],
                                [T, always(undefined)],
                            ]),
                        )(chunk);

                        if (!data || !data.timestamp || data.timestamp < TIMESTAMP_START) {
                            callback();
                            return;
                        }

                        callback(null, data);
                    },
                }));

            streams.push(stream);
        }

        zipStreams(streams).pipe(this);
    }
}
//
// export function getExchangeInstruments(exchange) {
//     return exchange.instruments;
// }
//
// export function getInstrumentMarketValues(exchange, time) {
//     return function (instrument) {
//
//     }
// }