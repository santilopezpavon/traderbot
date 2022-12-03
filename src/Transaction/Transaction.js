import { getConnectionSpot } from "../Connection/ConnectorSpot.js"
import { getCoinsInformation } from "../Connection/CoinsInformation.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const configuration = require('../../config.json');
export function getTransaction() {
    return Transaction.getInstance();
}

class Transaction {

    static #instance;

    #client;

    #priceTruncate;

    #qtyTruncate;

    #coinsInformation


    static getInstance() {
        if (!Transaction.#instance) {
            Transaction.#instance = new Transaction()
        }
        return Transaction.#instance
    }

    constructor() {
        this.#client = getConnectionSpot();
        this.#coinsInformation = getCoinsInformation();
        this.setParamatersTruncate();
    }

    async setParamatersTruncate() {
        const truncates = await this.#coinsInformation.getTruncates(configuration.observer.pair);
        this.#priceTruncate = truncates["price"];
        this.#qtyTruncate = truncates["qty"];
    }

    async getTruncates() {
        if(typeof this.#priceTruncate == 'undefined') {
            await this.setParamatersTruncate();
        }
        let basePrice = "0.";
        let baseQty = "0.";

        for (let index = 1; index < this.#priceTruncate; index++) {
            basePrice += "0";            
        }

        for (let index = 1; index < this.#qtyTruncate; index++) {
            baseQty += "0";            
        }
        basePrice += '1';
        baseQty += '1';

        return {
            "price": this.#priceTruncate,
            "qty": this.#qtyTruncate,
            "minUnitPrice": parseFloat(basePrice),
            "minUnitQty": parseFloat(baseQty)
        }       
    }

    async cancelOrder(orderId) {
        console.log("PETICION cancelOrder");
        return this.#client.cancelOrder(configuration.observer.pair, {
            orderId: orderId
        }).then(function (response) {
            return response;
        }).catch(function (error) {
            console.log(error);
            return false;
        });
    }

    async getOrder(orderId) {
        console.log("PETICION getOrder");
        return this.#client.getOrder(configuration.observer.pair, {
            orderId: orderId
        }).then(function (response) {
            return response;
        }).catch(function (error) {
            console.log(error);
            return false;
        });
    }

    async doBuy(price, qty) {
        console.log("PETICION doBuy");
        const current = this;

        const order = {
            "price": this.#truncate(price, "price"),
            "quantity": this.#truncate(qty, "qty"),
            "timeInForce": "GTC"
        };

        return current.#client.newOrder(configuration.observer.pair, "BUY", 'LIMIT', order).then(function (response) {
            return response;
        }).catch(function (error) {
            console.log(error);
            return false;
        });
    }

    async doSale(price, qty) {
        console.log("PETICION doSale");
        const current = this;

        const order = {
            "price": this.#truncate(price, "price"),
            "quantity": this.#truncate(qty, "qty"),
            "timeInForce": "GTC"
        };

        return current.#client.newOrder(configuration.observer.pair, "SELL", 'LIMIT', order).then(function (response) {
            return response;
        }).catch(function (error) {
            console.log(error);
            return false;
        });
    }

    #truncate(value, type) {

        let place = this.#priceTruncate;
        if (type == 'qty') {
            place = this.#qtyTruncate;
        }
        return Math.trunc(value * Math.pow(10, place)) / Math.pow(10, place);
    }

}