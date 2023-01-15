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
        this.numLoopsToMakeDecisions = 3;
        this.brain = getBrain();
        this.saleCorrector = getSalePriceCorrector();
        this.totalDemand = 0;
        this.totalDemandv2 = 0;
    }

    async initGoodDayOberver(callback = null) {
        let numLoop = 0;
        let points = 0;
        const pair = configuration.observer.pair;
        const time = configuration.observer.minutes;
        const current = this;
        current.totalDemand = 0;
        current.totalDemandv2 = 0;
        
        
        const isGoodMoment = await current.checkGoodMoment(pair);
        if (isGoodMoment === true) {
            points++;
            numLoop++;
            //console.log("Proceso " + ((numLoop / current.numLoopsToMakeDecisions) * 100));

        }
        
        const interval = setInterval(async () => {
            numLoop++;
            
            if (numLoop >= current.numLoopsToMakeDecisions) {
               /* console.log(numLoop);
                console.log(current.totalDemand);*/

                console.log((points / numLoop) + "%");
                /*console.log(current.totalDemand / numLoop);
                console.log(current.totalDemandv2 / numLoop);*/
                clearInterval(interval);
                if(callback !== null) {
                    callback(current.totalDemand / numLoop, current.totalDemandv2 / numLoop);
                }
            } else {
                //console.log("Proceso " + ((numLoop / current.numLoopsToMakeDecisions) * 100));
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
        //console.log(data.demandStrong);
        if (data.demandStrong > 0.58 && data.demandStrongV2Indicator > 0.5) {
            return true;
        }
        return false;
    }








}
