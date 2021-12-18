import {
    Transform
} from "stream";
import {
    endOfDay,
    isSameDay,
} from "date-fns";

import { ANALYZER_MAX_WINDOW_SIZE } from "../constants/analyzer";
import { CircularBuffer } from "../collections/circular-buffer";

export class Analyzer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });

        this.buffers = new Map();
    }

    _transform(chunk, encoding, callback) {
        const { timestamp, counterAsset, baseAsset } = chunk;

        const buffer = this.getOrCreateBuffer(`${counterAsset}/${baseAsset}`);

        const previousChunk = this.buffer.peek();
        if (!previousChunk) {

            this.buffer.push(chunk);

            callback();
            return;
        }

        const endOfDay = endOfDay(previousChunk.timestamp);



        callback();
    }

    getOrCreateBuffer(bufferName) {
        const existing = this.buffers.get(bufferName);
        if (existing) {
            return existing;
        }

        const buffer = new CircularBuffer(ANALYZER_MAX_WINDOW_SIZE);

        this.buffers.set(bufferName, buffer);

        return buffer;
    }
}