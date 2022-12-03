import { getFilesService } from "../Memory/Memory.js"
import { getCoinsInformation } from "../Connection/CoinsInformation.js"
import { getAnalisys } from "../Analisys/Analisys.js"
import { getOrderBookIndicators } from "../Indicators/OrderBookIndicators.js"
import {getBrain} from "../Brain/Brain.js"
import {getSalePriceCorrector} from "../Brain/SalePriceCorrector.js"


import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const configuration = require('../../config.json');

export function getOberver() {
    return Oberver.getInstance();
}

class Oberver {
    static #instance;

    fileService;

    nameFile;

    analisys;

    numLoopsToMakeDecisions;

    brain;

    saleCorrector;


    static getInstance() {
        if (!Oberver.#instance) {
            Oberver.#instance = new Oberver()
        }
        return Oberver.#instance
    }

    constructor() {
        this.nameFile = configuration.memory.data;
        this.fileService = getFilesService(this.nameFile);
        this.analisys = getAnalisys();
        this.numLoopsToMakeDecisions = 10;
        this.brain = getBrain();
        this.saleCorrector = getSalePriceCorrector();
    }

    async initObserver() {
        let numLoop = 0;
        const pair = configuration.observer.pair;
        const time = configuration.observer.minutes;
        const current = this;
        
        await current.observation(pair);
        const priceBuy = this.analisys.getBuyOptimalPrice();
        console.log("Precio Optimo Compra " + priceBuy);
        if(configuration.observer.doBuy === true && priceBuy !== false) {
            current.brain.totalBuy(priceBuy);
        }
        current.brain.totalSale();
        setInterval(async () => {
            if(numLoop % configuration.cicles.ciclesRefreshParameters == 0 ) {
                await current.brain.updateParameters();
            }
            if(numLoop % configuration.cicles.ciclesCheckSale == 0 ) {
                await current.saleCorrector.correctPriceSale();
            }
            await current.observation(pair);
            //if(current.numLoopsToMakeDecisions <= numLoop) {
                const priceBuy = current.analisys.getBuyOptimalPrice();
                console.log("Precio Optimo Compra " + priceBuy);
                if(configuration.observer.doBuy === true && priceBuy !== false) {
                    current.brain.totalBuy(priceBuy);
                }
                if(configuration.observer.doSale === true) {
                    current.brain.totalSale();
                }

          //  }
            numLoop++;
        }, time * 60 * 1000);
    }

    async observation(pair) {
        const coin = configuration.observer.coin;

        const coinInfo = await getCoinsInformation();
        const currentPrice = await coinInfo.getCurrentPrice(coin);
        const orderBookIndicators = getOrderBookIndicators();
        const data = await orderBookIndicators.getIndicators(pair);

        this.brain.setCurrentPrice(currentPrice);

        let objectToSave = {
            "price": currentPrice,
            "demandStrong": data.demandStrong,
            "firstOfferZone": data.firstOfferZone,
            "firstDemandZone": data.firstDemandZone,
            "freq": 1
        };

        let file = this.fileService.loadFile();

        for (const key in file) {
            if (Object.hasOwnProperty.call(file, key)) {
                file[key].freq = file[key].freq * 0.95;
            }
        }

        this.fileService.saveFile(file);

        file = this.fileService.loadFile();

        if (file.hasOwnProperty(currentPrice)) {
            const currentFreq = file[currentPrice].freq;
            objectToSave["freq"] = currentFreq + 1;
        }


        

        this.fileService.addItemFileObject(objectToSave, "price");

        console.log("-------");
        console.log("Current Price " + currentPrice);

        const dataFile = this.fileService.loadFile();
        console.table(this.retrunInfoOrderedBy(dataFile, "price"));
        return dataFile;
    }

    retrunInfoOrderedBy(dataFile, propOrder, order = 'ASC') {
        let sortable = [];
        for (var vehicle in dataFile) {
            sortable.push([vehicle, dataFile[vehicle]]);
        }
    
        sortable.sort(function (a, b) {
            if(order === 'ASC') {
                return a[1][propOrder] - b[1][propOrder];
    
            } else {
                return b[1][propOrder] - a[1][propOrder];
            }
        });
        
        let printInfo = [];
        for (let index = 0; index < sortable.length; index++) {
            const element = sortable[index];
            printInfo.push({
                "price": element[1].price,
                "demandStrong": element[1].demandStrong,
                "firstOfferZone": element[1].firstOfferZone,
                "firstDemandZone": element[1].firstDemandZone,
                "freq": element[1].freq
            })        
        }
    
        return printInfo;
    }
}
