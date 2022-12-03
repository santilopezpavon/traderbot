import { getFilesService } from "../Memory/Memory.js"

import { createRequire } from 'node:module';
import { exit } from "node:process";
const require = createRequire(import.meta.url);

const configuration = require('../../config.json');

export function getAnalisys() {
    return Analisys.getInstance();
}

class Analisys {
    static #instance;

    fileService;

    nameFile;

    static getInstance() {
        if (!Analisys.#instance) {
            Analisys.#instance = new Analisys()
        }
        return Analisys.#instance
    }

    constructor() {
        this.nameFile = configuration.memory.data;
        this.fileService = getFilesService(this.nameFile);
    }

    analiseOptimalPrices() {
        const dataFile = this.getDataFromMemory();

        if(dataFile === false || dataFile.length < 3) {
            return false;
        }

        return {
            "optimalBuy": this.getBuyOptimalPrice(),
            "optimalSale":this.getSaleOptimalPrice()
        }
    }

    getDataFromMemory() {
        const fileData = this.fileService.loadFile();
        if (fileData === false) {
            return false;
        }
        return Object.values(fileData);
    }

    getDataSorted(propOrder, order = 'ASC') {
        const dataFile = this.getDataFromMemory();
        if (dataFile === false) {
            return false;
        }
        dataFile.sort(function (a, b) {
            if (order === 'ASC') {
                return a[propOrder] - b[propOrder];

            } else {
                return b[propOrder] - a[propOrder];
            }
        });

        return dataFile;
    }

    getMoreFrequentData() {
        const data = this.getDataSorted("freq", "DESC");
        return data[0];
    }

    getDataWithRelativeFreq() {
        const data = this.getDataSorted("price", "ASC");

        let posMoreFreq = 0;
        let maxFreq = 0;

        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if(element.freq > maxFreq) {
                maxFreq = element.freq;
                posMoreFreq = index;
            }           
        }

        for (let index = 0; index < data.length; index++) {
            data[index]["relativeFreq"] =   data[index].freq / maxFreq;        
        }

        return data;
    }

    getBuyOptimalPrice() {

        const data = this.getDataSorted("price", "ASC");
        let posMoreFreq = 0;
        let maxFreq = 0;

        if(data.length < 2) {
            return false;
        }

        

        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if(element.freq > maxFreq) {
                maxFreq = element.freq;
                posMoreFreq = index;
            }           
        }

        for (let index = 0; index < data.length; index++) {
            data[index]["relativeFreq"] =   data[index].freq / maxFreq;        
        }

        let posFirstMoreFreq = 0;
        for (let index = 0; index < data.length; index++) {
            if(data[index]["relativeFreq"] > 0.92) {
                posFirstMoreFreq = index;
                break;
            }     
        }

        if(posFirstMoreFreq === 0) {
            return false;
        }


        console.log(data[posFirstMoreFreq]);

        const firstMoreFreqData = data[posFirstMoreFreq];
        if(
            firstMoreFreqData.demandStrong > 0.55 &&
            firstMoreFreqData.firstDemandZone > (firstMoreFreqData.price - 0.03)
        ) {
            return firstMoreFreqData.price - 0.02;
        }

        return false;
    }

    getSaleOptimalPrice() {
        const data = this.getDataSorted("price", "DESC");
        const moreFreq = this.getMoreFrequentData();

        let saleOptimalPrice = false;

        for (let index = 0; index < data.length; index++) {
            const price = data[index].price;
            const demandStrong = data[index].demandStrong;
            const freq = data[index].freq;

            if (moreFreq.price < price) {
                continue;
            }

            if (0.60 < demandStrong) {
                continue;
            }
            if ((freq / moreFreq.freq) < 0.3) {
                continue;
            }

            saleOptimalPrice = price;
            break;
        }
        return saleOptimalPrice;
    }
}
