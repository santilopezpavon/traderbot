import { Spot } from '@binance/connector';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const configuration = require('../../config.json');


export function getConnectionSpot() {
    return ConnectorSpot.getInstance().getConnection();
}

class ConnectorSpot {

    static #instance;

    #client;

    static getInstance() {
        if (!ConnectorSpot.#instance) {
            ConnectorSpot.#instance = new ConnectorSpot()
        }
        return ConnectorSpot.#instance
    }

    constructor() {
        this.#client = new Spot(configuration.apiBinance.publicKey, configuration.apiBinance.privateKey);
    }

    getConnection() {
        return this.#client;
    }
}


