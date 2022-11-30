import { getOrderBook } from "./src/OrderBook/OrderBook.js"
import { getCoinsInformation } from "./src/Connection/CoinsInformation.js"
import { getOrderBookIndicators } from "./src/Indicators/OrderBookIndicators.js"
import { getFilesService } from "./src/Memory/Memory.js"
import { getOberver } from "./src/Observer/Oberver.js"


const coinInfo = getCoinsInformation();
coinInfo.getTruncates("DOTBUSD").then(function (res) {
    console.log(res);
});
