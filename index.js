import { getOrderBook } from "./src/OrderBook/OrderBook.js"
import { getCoinsInformation } from "./src/Connection/CoinsInformation.js"
import { getOrderBookIndicators } from "./src/Indicators/OrderBookIndicators.js"
import { getFilesService } from "./src/Memory/Memory.js"
import { getOberver } from "./src/Observer/Oberver.js"



/**
 * 1. Oportunidad de Compra.
 *  * demandStrong > 0.65
 *  * Bajo en rango
 *  * Por debajo de precio frecuente
 * 2. Oportunidad de Venta
 *  * demandStrong < 0.60
 *  * Por encima de precio frecuente
 */
/*
const fileService = getFilesService("name");
fileService.saveFile({
    "name": 12,
    "name2": 15
});
*/
const minutos = 1;
const fileService = getFilesService("name-2");



const observer = getOberver();
observer.initObserver();




/*
generar("DOTBUSD");
setInterval(function () {
    generar("DOTBUSD");
}, 1000 * 60 * minutos);
*/
let frecuenciasPrecio = {};

async function generar(pair) {
    const coin = pair.replace("BUSD", "");
    const coinInfo = await getCoinsInformation();
    const currentPrice = await coinInfo.getCurrentPrice(coin);
    const orderBookIndicators = getOrderBookIndicators();
    const data = await orderBookIndicators.getIndicators(pair);

    if(!frecuenciasPrecio.hasOwnProperty(currentPrice)) {
        frecuenciasPrecio[currentPrice] = 1;
    } else {
        frecuenciasPrecio[currentPrice]++;
    }
    let objectToSave = {
        "price": currentPrice,
        "demandStrong": data.demandStrong,
        "firstOfferZone": data.firstOfferZone,
        "firstDemandZone": data.firstDemandZone,
        "freq": frecuenciasPrecio[currentPrice]
    };

    fileService.addItemFileObject(objectToSave, "price");
    const dataFile = fileService.loadFile();    
    
    
    console.log("--------");
    console.log("Current Price " + currentPrice);

    const printInfo = retrunInfoOrderedBy(dataFile, "price");

    console.table(printInfo);

    const printInfoFreq = retrunInfoOrderedBy(dataFile, "freq", "DESC");

    console.table(printInfoFreq);



}


function retrunInfoOrderedBy(dataFile, propOrder, order = 'ASC') {
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
// information("DOTBUSD", 5.40);



//let ulitmoPrecioCompra = 
async function information(pair, precioVenta) {
    let coin = pair.replace("BUSD", "");
    const coinInfo = await getCoinsInformation();
    const currentPrice = await coinInfo.getCurrentPrice(coin);
    const orderBookIndicators = getOrderBookIndicators();
    const data = await orderBookIndicators.getIndicators(pair);
    console.log("El precio actual es de " + currentPrice);
    console.table(data);
}



