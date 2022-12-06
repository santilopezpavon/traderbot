import { getFilesService } from "../Memory/Memory.js"
import { getCoinsInformation } from "../Connection/CoinsInformation.js"
import { getAnalisys } from "../Analisys/Analisys.js"
import { getOrderBookIndicators } from "../Indicators/OrderBookIndicators.js"
import { getBrain } from "../Brain/Brain.js"
import { getSalePriceCorrector } from "../Brain/SalePriceCorrector.js"


import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const configuration = require('../../config.json');

export function getGoodDay() {
    return GoodDay.getInstance();
}

class GoodDay {
    static #instance;

    fileService;

    nameFile;

    analisys;

    numLoopsToMakeDecisions;

    brain;

    saleCorrector;


    static getInstance() {
        if (!GoodDay.#instance) {
            GoodDay.#instance = new GoodDay()
        }
        return GoodDay.#instance
    }

    constructor() {
        this.nameFile = configuration.memory.gooday;
        this.analisys = getAnalisys();
        this.numLoopsToMakeDecisions = 30;
        this.brain = getBrain();
        this.saleCorrector = getSalePriceCorrector();
    }

    async initGoodDayOberver() {
        let numLoop = 0;
        let points = 0;
        const pair = configuration.observer.pair;
        const time = configuration.observer.minutes;
        const current = this;
        const isGoodMoment = await current.checkGoodMoment(pair);
        if (isGoodMoment === true) {
            points++;
        }
        console.log(isGoodMoment);
        const interval = setInterval(async () => {
            numLoop++;
            const isGoodMoment = await current.checkGoodMoment(pair);
            if (isGoodMoment === true) {
                points++;
            }
            if (numLoop > 1) {
                console.log((points / numLoop) + "%");
                clearInterval(interval);
            }
        }, time * 60 * 1000);

    }

    async checkGoodMoment(pair) {
        const orderBookIndicators = getOrderBookIndicators();
        const data = await orderBookIndicators.getIndicators(pair);

        if (data.demandStrong > 0.6 && data.demandStrongV2Indicator > 0.5) {
            return true;
        }
        return false;
    }








}
