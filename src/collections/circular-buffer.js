
export class CircularBuffer {
    constructor(size) {
        this._size = size;
        this._buffer = new Array(size);
        this._pointer = 0;
        this._length = 0;
    }

    get length() {
        return this._length;
    }

    push(value) {
        this._buffer[this._pointer] = value;
        this._pointer = (this._pointer + 1) % this._size;
        this._length = Math.min(this._size, this._length + 1);

        return value;
    }

    peek() {
        if (this._length === 0) {
            return;
        }

        return this._buffer[(this._size + this._pointer - 1) % this._size];
    }

    *[Symbol.iterator]() {
        const start = this._length === this._size ? this._pointer : 0;
        for (let i = 0; i < this._length; i++) {
            yield this._buffer[(start + i) % this._size];
        }
    }
}
