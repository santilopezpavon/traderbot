import { getCoinsInformation } from "./src/Connection/CoinsInformation.js"
import { getGoodDay } from "./src/Observer/GoodDay.js"

const operationDate = new Date(1673776242536);
const date = new Date();


console.log(date);
console.log(operationDate);
let diferencia = date.getTime() - operationDate.getTime();
let horasTranscurridas = diferencia / 1000 / 60 / 60;
let minutosTranscurridos = horasTranscurridas * 60;



console.log(minutosTranscurridos);

/*

const coinsInfo = getCoinsInformation();

init();
setInterval(async function () {
    init();
}, 10 * 60 * 1000);


async function init() {
    console.log("****************");
    const priceInit = await coinsInfo.getCurrentPrice("DOT");
    const observer = getGoodDay();
    observer.initGoodDayOberver(async function (demandStrong, demandStrongV2) {
        const price = await coinsInfo.getCurrentPrice("DOT");
        console.log("Current Price " + price);
        console.log("Median Price " + ((priceInit + price) / 2));
        console.log("demandStrong " + demandStrong);
        console.log("demandStrongV2 " + demandStrongV2);
    });
}*/