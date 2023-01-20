import { getOrderBookIndicators } from "../Indicators/OrderBookIndicators.js"


import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const configuration = require('../../config.json');

export function getGoodDay() {
    return GoodDay.getInstance();
}

class GoodDay {
    static #instance;

    numLoopsToMakeDecisions;

    static getInstance() {
        if (!GoodDay.#instance) {
            GoodDay.#instance = new GoodDay()
        }
        return GoodDay.#instance
    }

    constructor() {
        this.numLoopsToMakeDecisions = 20;
        this.totalDemand = 0;
        this.totalDemandv2 = 0;
    }

    async initGoodDayOberver(callback = null) {
        let numLoop = 0;
        let points = 0;
        const pair = configuration.observer.pair;
        const time = 0.5;
        const current = this;
        current.totalDemand = 0;
        current.totalDemandv2 = 0;
        
        
        const isGoodMoment = await current.checkGoodMoment(pair);
        if (isGoodMoment === true) {
            points++;
        }
        numLoop++;

        const interval = setInterval(async () => {
            numLoop++;
            if (numLoop >= current.numLoopsToMakeDecisions) {
                clearInterval(interval);
                if(callback !== null) {
                    var score = points / numLoop;
                    callback({
                        points,
                        numLoop,
                        score
                    });
                }
            } else {
                const isGoodMoment = await current.checkGoodMoment(pair);
                if (isGoodMoment === true) {
                    points++;
                }
            }
        }, time * 60 * 1000);
    }

    async checkGoodMoment(pair) {
        const orderBookIndicators = getOrderBookIndicators();
        const data = await orderBookIndicators.getIndicators(pair);
        this.totalDemand+= data.demandStrong;
        this.totalDemandv2 += data.demandStrongV2Indicator;
        if (data.demandStrong >= 0.55 && data.demandStrongV2Indicator >= 0.5) {
            return true;
        }
        return false;
    }








}
