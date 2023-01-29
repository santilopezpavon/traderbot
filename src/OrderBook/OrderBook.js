import { getCoinsInformation } from "../Connection/CoinsInformation.js"


export function getOrderBook() {
    return OrderBook.getInstance();
}

class OrderBook {
    static #instance;

    #coinsInfo;

    static getInstance() {
        if (!OrderBook.#instance) {
            OrderBook.#instance = new OrderBook()
        }
        return OrderBook.#instance
    }

    constructor() {
        this.#coinsInfo = getCoinsInformation();
    }

    async getBookOrder(pair, deep) {
        let bookOrder = await this.#coinsInfo.getBookOrder(pair, deep);

        const bidsData = this.formatData(bookOrder, "bids");
        const asksData = this.formatData(bookOrder, "asks");           

        return {
            "asks": asksData.valuesProp,
            "bids": bidsData.valuesProp,
            "totalQtyBids": bidsData.totValuesProp,
            "totalQtyAsks": asksData.totValuesProp
        };
    }

    formatData(bookOrder, prop) {

        let resultBookOrder = {
            "valuesProp": [],
            "totValuesProp": 0,
        };
        
        const propItemsAnalise = bookOrder[prop];

        let pos = 0;
        let max = null;

        for (let index = 0; index < propItemsAnalise.length; index++) {
            resultBookOrder.valuesProp[index] = {
                "price": null,
                "qty": null
            }
            resultBookOrder.valuesProp[index]["price"] = parseFloat(propItemsAnalise[index][0]);     
            resultBookOrder.valuesProp[index]["qty"] = parseFloat(propItemsAnalise[index][1]);              
            resultBookOrder.totValuesProp += resultBookOrder.valuesProp[index]["qty"];

            if(max === null || max < resultBookOrder.valuesProp[index]["qty"]) {
                max = resultBookOrder.valuesProp[index]["qty"];
                pos = index;
            }
        }

        for (let index = 0; index < resultBookOrder.valuesProp.length; index++) {
            const qty = resultBookOrder.valuesProp[index].qty; 
            const relevance = qty / max;          
            resultBookOrder.valuesProp[index]["relevance"] = relevance;
        }

        return resultBookOrder;
    }


    async getStrongPosition(pair) {

        const bookOrder = await this.getBookOrder(pair, 10);
        if(bookOrder === false) {
            return false;
        }

        const ofertUnits = bookOrder.totalQtyAsks;
        const demandUnits = bookOrder.totalQtyBids;
        const percentOfertUnits = ofertUnits / (ofertUnits + demandUnits)
        const percentDemandUnits = demandUnits / (ofertUnits + demandUnits)

        return {
            demandUnits,ofertUnits, percentDemandUnits, percentOfertUnits
        }
    }

    async getZones(pair, relevance = 0.65) {
        const bookOrder = await this.getBookOrder(pair, 50);

        const zones = {
            "asksZones": [],
            "bidsZones": [],
            "range": {
                "from": null,
                "to": null
            }
        };

        const bids = bookOrder.bids;
        const asks = bookOrder.asks;

        for (let index = 0; index < bids.length; index++) {
            const relevanceCurrent = bids[index].relevance;
            if(relevanceCurrent >= relevance) {
                zones.bidsZones.push(bids[index]);
            }            
        }

        for (let index = 0; index < asks.length; index++) {
            const relevanceCurrent = asks[index].relevance;
            if(relevanceCurrent >= relevance) {
                zones.asksZones.push(asks[index]);
            }            
        }

        zones.range.from = zones.bidsZones[0]
        zones.range.to = zones.asksZones[0]
        return zones;
    }
}
