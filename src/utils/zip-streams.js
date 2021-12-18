import {
    PassThrough,
    Transform,
} from "stream";

export const zipStreams = (streams) => {
    const streamMap = new WeakMap();

    const output = new PassThrough({
        objectMode: true,
    });

    streams.forEach((stream) => {
        streamMap.set(stream, {
            callbacks: [],
            buffer: [],
        });

        const pushToOutput = () => {
            const chunks = [];
            const pendingCallbacks = [];
            streams.forEach((stream) => {
                const { callbacks, buffer } = streamMap.get(stream);

                pendingCallbacks.push(callbacks.shift());
                chunks.push(buffer.shift());
            });
            output.push(chunks);

            pendingCallbacks.forEach((callback) => callback());
        };

        const isBufferFull = () => streams.every((stream) => {
            const { buffer } = streamMap.get(stream);
            return buffer.length > 0;
        });

        const addToBuffer = (stream, chunk, callback) => {
            let { callbacks, buffer } = streamMap.get(stream);
            callbacks.push(callback);
            buffer.push(chunk);
        };

        const transform = new Transform({
            objectMode: true,
            transform(chunk, encoding,  callback) {
                if (!chunk) {
                    console.debug('ended')
                    // ended, flush all
                    if (isBufferFull()) {
                        pushToOutput();
                    }

                    this.end();
                    return;
                }

                addToBuffer(stream, chunk, callback);

                if (isBufferFull()) {
                    pushToOutput();
                }
            },
        });

        stream.pipe(transform);
    });

    return output;
};
