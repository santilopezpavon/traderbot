import { getOrderBook } from "./src/OrderBook/OrderBook.js"
import { getCoinsInformation } from "./src/Connection/CoinsInformation.js"
import { getSalePriceCorrector } from "./src/Brain/SalePriceCorrector.js"
import { getTransaction } from "./src/Transaction/Transaction.js"

const trans = getTransaction();
trans.getTruncates().then(function (res) {
    console.log(res);
});

/*
import { getBrain } from "./src/Brain/Brain.js"
const brain = getBrain();

brain.totalSale().then(function (res) {
    console.log(res);
   
*/


/*
const account = getAccount();
account.getStockOf("BUSD").then(function (res) {
    console.log(res);
});*/
/*
const coinInfo = getCoinsInformation();
coinInfo.getTruncates("DOTBUSD").then(function (res) {
    console.log(res);
});
*/