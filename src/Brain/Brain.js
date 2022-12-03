import { getMemoryInMemory } from "../Memory/MemoryInMemory.js"
import { getAccount } from "../Account/Account.js"
import { getConnectionSpot } from "../Connection/ConnectorSpot.js"
import { getCoinsInformation } from "../Connection/CoinsInformation.js";
import { getTransaction } from "../Transaction/Transaction.js";


import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const configuration = require('../../config.json');

export function getBrain() {
    return Brain.getInstance();
}

class Brain {

    static #instance;

    #memory;

    #account;

    #coinsInformation

    #transaction

    #currentPrice

    static getInstance() {
        if (!Brain.#instance) {
            Brain.#instance = new Brain()
        }
        return Brain.#instance
    }

    constructor() {
        this.#memory = getMemoryInMemory();
        this.#account = getAccount();
        this.#coinsInformation = getCoinsInformation();
        this.#currentPrice = null;
        this.#transaction = getTransaction();
    }   

    setCurrentPrice(currentPrice) {
        this.#currentPrice = currentPrice;
    }

    async totalBuy(priceBuy) {
        const memoryBuyData = this.#memory.getPermanent("buy");
        if (memoryBuyData != false && memoryBuyData.hasOwnProperty("purchaseData")) {
            const priceOrdeToCancel = memoryBuyData.priceBuy;
            if (priceBuy > priceOrdeToCancel) {
                const orderIdToCancel = memoryBuyData.purchaseData.orderId;
                const canceledOrder = await this.cancelOrder(orderIdToCancel);
                
            }
        }

        const purchasePower = await this.getPurchaseQty();
        console.log("purchasePower " + purchasePower);
        if (purchasePower > 10) {
            const qty = purchasePower / priceBuy;
            const purchase = await this.doBuy(priceBuy, qty);
            if (purchase !== false) {
                const nowDatetime = Date.now();
                this.#memory.setPermanent("buy", {
                    "priceBuy": priceBuy,
                    "time": nowDatetime,
                    "qty": qty,
                    "purchaseData": purchase.data
                });
            }
        }
    }

    async totalSale() {
        // Saber si se creo orden
        console.log("totalSale");
        const memoryBuyData = this.#memory.getPermanent("buy");
        console.log(memoryBuyData);
        if (memoryBuyData == false || !memoryBuyData.hasOwnProperty("purchaseData")) {
            console.log("totalSale 2");

            return false; // No hay  compra.
        }


        const pricePassed = await this.priceIsPassed(memoryBuyData.priceBuy);
        if (pricePassed === false) {
            return false; //TODO : DESCOMENTAR
        }

        console.log(memoryBuyData.priceBuy);
        console.log("totalSale 3");

        // Saber si la orden fue ejecutada
        await this.updateParameters();

        const availablePower = await this.getAvailableQty();
        console.log(availablePower);
        if (availablePower < 10) {
            return false;
        }
        const historical = await this.#coinsInformation.getHistoricalData(configuration.observer.pair, "1m");
        const currentPrice = historical[historical.length - 1].close;
        let priceSale = memoryBuyData.priceBuy + 0.02;

        if (currentPrice > priceSale) {
            priceSale = currentPrice + 0.01;
        }

        const sellOperation = await this.doSale(priceSale, availablePower);
        if (sellOperation !== false) {
            this.#memory.setPermanent("sale", {
                "priceSale": priceSale,
                "saleData": sellOperation.data,
                "priceBuy": memoryBuyData.priceBuy
            }); 
            this.#memory.setPermanent("buy", {});
            
        }
        //Saber si compra puede haber pasado

        // Acutalizar datos

        // Verificar y proceder a compra con precio nuevo 
    }


    async priceIsPassed(price) {
        const historical = await this.#coinsInformation.getHistoricalData(configuration.observer.pair, "1m");


        for (let index = 1; index < 4; index++) {
            let low = historical[historical.length - index].low;
            let high = historical[historical.length - index].high;
    
            if (price <= high && price >= low) {
                return true;
            }
        }      

       
        return false;
    }


    async cancelOrder(orderId) {
        const current = this;
        const orderCanceled = await this.#transaction.cancelOrder(orderId);
        if(orderCanceled !== false) {
            await current.updateParameters();
        }
        return orderCanceled;        
    }


    async doBuy(price, qty) {
        const current = this;
        const orderBuy = await this.#transaction.doBuy(price, qty);
        if(orderBuy !== false) {
            await current.updateParameters();
        }
        return orderBuy;
    }

    async doSale(price, qty) {
        const current = this;
        const orderSale = await this.#transaction.doSale(price, qty);
        if(orderSale !== false) {
            await current.updateParameters();
        }
        return orderSale;
    }

    async hasPruchasePower() {
        const purchaseQty = await this.getPurchaseQty();
        if(purchaseQty > 10) {
            return true;
        }
        return false;
    }

    async getPurchaseQty() {
        let purchaseQty = this.#memory.get("purchaseQty");
        if (purchaseQty === false) {
            const qty = await this.#account.getStockOf(configuration.observer.purschase);
            this.#memory.set("purchaseQty", qty);
            purchaseQty = this.#memory.get("purchaseQty");
        }
        return purchaseQty;
    }

    async getAvailableQty() {
        let availableQty = this.#memory.get("availableQty");
        if (availableQty === false) {
            const qty = await this.#account.getStockOf(configuration.observer.coin);
            this.#memory.set("availableQty", qty);
            availableQty = this.#memory.get("availableQty");
        }
        return availableQty;
    }

    async updateParameters() {
        const qtyAvailable = await this.#account.getStockOf(configuration.observer.coin);
        this.#memory.set("availableQty", qtyAvailable);

        const qtyPurch = await this.#account.getStockOf(configuration.observer.purschase);
        this.#memory.set("purchaseQty", qtyPurch);
        return true;
    }

}





