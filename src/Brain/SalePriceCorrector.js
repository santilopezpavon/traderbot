import { createRequire } from 'node:module';
import { getCoinsInformation } from '../Connection/CoinsInformation.js';
import { getBrain } from './Brain.js';
import { getMemoryInMemory } from "../Memory/MemoryInMemory.js"
import { getFilesService } from "../Memory/Memory.js"
import { getAnalisys } from '../Analisys/Analisys.js';
import { getTransaction } from "../Transaction/Transaction.js";

const require = createRequire(import.meta.url);

const configuration = require('../../config.json');


export function getSalePriceCorrector() {
    return SalePriceCorrector.getInstance();
}

class SalePriceCorrector {

    static #instance;

    #coinsInformation

    #brain

    #memory

    #analisys

    #transaction

    static getInstance() {
        if (!SalePriceCorrector.#instance) {
            SalePriceCorrector.#instance = new SalePriceCorrector()
        }
        return SalePriceCorrector.#instance
    }

    constructor() {
        this.fileService = getFilesService(configuration.memory.data);
        this.#coinsInformation = getCoinsInformation();
        this.#brain = getBrain();
        this.#memory = getMemoryInMemory();
        this.#analisys = getAnalisys();
        this.#transaction = getTransaction();
    }

    async getCurrentPrice() {
        const historical = await this.#coinsInformation.getHistoricalData(configuration.observer.pair, "1m");
        return historical[historical.length - 1].close;
    }

    async correctPriceSale() {

        const saleCurrentInformation = await this.getCurrentSaleInformation();
        if (saleCurrentInformation === false) {
            return false;
        }

        console.log(saleCurrentInformation);

        const priceSaleObjective = saleCurrentInformation.priceSale;
        const pirceBuyOrigin = saleCurrentInformation.priceBuy;
        const orderId = saleCurrentInformation.saleData.orderId;

        const priceCurrent = await this.getCurrentPrice();

        let probableGetPrice = await this.isProbableGetPrice(priceSaleObjective, priceCurrent);
        console.log("Es posible alcanzar precio venta: " + probableGetPrice);
        if(probableGetPrice === true) {
            return false;
        }

        // Analizar y modificar la orden.

        const newPrice = await this.getNewPrice(priceSaleObjective, pirceBuyOrigin, priceCurrent);
        if(newPrice === false) {
            return false;
        }

        const orderCanceled = await this.#transaction.cancelOrder(orderId);
        if(orderCanceled !== false) {
            await this.#brain.updateParameters();
            // Crear una nueva Orden.
            const qtySale = parseFloat(saleCurrentInformation.saleData.origQty);
            const priceSale = newPrice;
            const newOrder = await this.#transaction.doSale(priceSale, qtySale);
            if(newOrder !== false) {
                await this.#brain.updateParameters();
                this.#memory.setPermanent("sale", {
                    "priceSale": priceSale,
                    "saleData": newOrder.data,
                    "priceBuy": pirceBuyOrigin
                }); 
            }
        }

    }

    async getNewPrice(priceSaleObjective, pirceBuyOrigin, priceCurrent) {
       // Ajuste inicial al precio.
        let newPrice = priceSaleObjective - 0.01;

        if(
            newPrice < pirceBuyOrigin   // Pérdida
        ) { 
            const diff = (pirceBuyOrigin - priceCurrent) / priceCurrent;
            if(diff < 0.012) {
                return false;
            }
        }
        

        console.log("Price Current getNewPrice " + priceCurrent);
        console.log("newPrice getNewPrice " + newPrice);

        if( newPrice> (priceCurrent + 0.01)) { // Con margen de seguridad de una unidad
            return newPrice;
        }
        return false;       
    }

    async isProbableGetPrice(price, priceCurrent) {
        

        const salePriceInfomration = await this.getSavedInformationPrice(price);
        if (salePriceInfomration === false) {
            if(price > priceCurrent) {
                const incrementPrice = (price - priceCurrent) / priceCurrent;
                if(incrementPrice > 0.3) {
                    return false;
                }
            }
            return true; // No tengo información para mover el precio.
        }

        if (
            salePriceInfomration.freq < 2 ||
            (
                salePriceInfomration.relativeFreq < 0.25 &&
                salePriceInfomration.demandStrong < 0.55
            )
        ) {
            return false;
        }

        return true;
    }

    getSavedInformationPrice(price) {
        const data = this.#analisys.getDataWithRelativeFreq();
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.price == price) {
                return element;
            }
        }
        return false;
    }

    async getCurrentSaleInformation() {
        const memorySaleData = this.#memory.getPermanent("sale");
        if (memorySaleData == false || !memorySaleData.hasOwnProperty("saleData")) {
            return false;
        }
        const oderIdSaleOperation = memorySaleData.saleData.orderId;
        const order = await this.#transaction.getOrder(oderIdSaleOperation);

        if (
            order !== false &&
            order.hasOwnProperty("data") &&
            order.data.status === "FILLED"
        ) {
            this.#memory.setPermanent("sale", {});
            return false;
        }
        return memorySaleData;
    }



}


