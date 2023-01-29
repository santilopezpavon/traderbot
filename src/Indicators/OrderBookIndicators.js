import { getOrderBook } from "../OrderBook/OrderBook.js"


export function getOrderBookIndicators() {
    return OrderBookIndicators.getInstance();
}

class OrderBookIndicators {
    static #instance;

    #orderBook;

    static getInstance() {
        if (!OrderBookIndicators.#instance) {
            OrderBookIndicators.#instance = new OrderBookIndicators()
        }
        return OrderBookIndicators.#instance
    }

    constructor() {
        this.#orderBook = getOrderBook();
    }

    async getIndicators(pair) {
        const strong = await this.#orderBook.getStrongPosition(pair);
        const zones = await this.#orderBook.getZones(pair, 0.5);

        if(strong === false || zones === false) {
            return false;
        }

        return {
            "demandStrong": strong.percentDemandUnits / (strong.percentDemandUnits + strong.percentOfertUnits), // //0 a 1
            "demandStrongV2Indicator": zones.bidsZones.length / (zones.bidsZones.length + zones.asksZones.length), //0 a 1
            "numberDemandZones": zones.bidsZones.length,
            "numberOfferZones": zones.asksZones.length,
            "firstOfferZone": zones.asksZones[0].price,
            "lastOfferZone": zones.asksZones[zones.asksZones.length - 1].price,
            "firstDemandZone": zones.bidsZones[0].price,
            "lastDemandZone": zones.bidsZones[zones.bidsZones.length - 1].price,
        }
    }

}
