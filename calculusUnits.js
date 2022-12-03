import { getTransaction } from "./src/Transaction/Transaction.js"
const myArgs = process.argv.slice(2);

const price = parseFloat(myArgs[0]);

const trans = getTransaction();
trans.getTruncates().then(function (res) {
    const minUnit = res.minUnitPrice;
    for (let index = 1; index < 10; index++) {
        console.log(index + " Unidad");
        const rentabilida = (index * minUnit / price) * 100;
        console.log(rentabilida + "%");
    }
});

/**
 * 
 * 1 Unidad
0.17857142857142858%
2 Unidad
0.35714285714285715%
 */






console.log(price);