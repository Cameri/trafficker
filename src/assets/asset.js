const assets = new Map();

export class Asset {
    constructor(name) {
        this.name = name;
    }

    toString() {
        return this.name;
    }

    [Symbol.toPrimitive]() {
        return this.name;
    }

    static from(assetName) {
        const existing = assets.get(assetName);

        if (existing) {
            return existing;
        }

        const asset = new Asset(assetName);

        assets.set(assetName, asset);

        return asset;
    }
}
