import { getGoodDay } from "./src/Observer/GoodDay.js"

const observer = getGoodDay();
observer.initGoodDayOberver(function (res) {
    console.log((res.points / res.numLoop) * 100 + '' + "%");
});