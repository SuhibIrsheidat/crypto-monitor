const D = document;
var topGainersLastHours = [];
var last10Candles = []
var currentPrices = []

init()
setInterval(function() {
    init()
}, 15000);

async function init() {
    topGainersLastHours = [];
    last10Candles = []
    currentPrices = []
    await getTopGainersLastHours();
    await presentData();
}

async function getTopGainersLastHours() {
    const numTopGainers = 24;
    const url = 'https://api.binance.com/api/v3/ticker/24hr';

    try {
        const response = await axios.get(url);
        const data = response.data;
        const filteredData = 
            data.filter(item => item.symbol.endsWith('USDT') && 'priceChangePercent' in item);
        filteredData.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
        for (let i = 0; i < numTopGainers && i < filteredData.length; i++) {
            const symbol = filteredData[i].symbol;
            const priceChangePercentage = parseFloat(filteredData[i].priceChangePercent);
            topGainersLastHours.push({ token: symbol, priceChangePercentage: priceChangePercentage });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getLast10CandlesForCryptos(token) {
    const numCandles = 60;
    const url = `https://api.binance.com/api/v3/klines?symbol=${token}&interval=1m&limit=${numCandles}`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const candlesList = data.map(function (candle, idx) {
            const openPrice = candle[1];
            const closePrice = candle[4];
            return [openPrice, closePrice];
        });
        return candlesList;
    } catch (error) {
        console.error('Error:', error);
        return { token, candles: [] }; // Return an empty array if there's an error
    }
}

async function getCurrentPriceOfTokens(token) {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${token}`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const currentPrice = data.price;
        return { token, currentPrice };
    } catch (error) {
        console.error('Error:', error);
        return { token, currentPrice: 0 }; // Return a default value if there's an error
    }
}

async function presentData() {
    var monitor = D.getElementById('monitor');

    var htmlTxt = ''
    for (let i = 0; i < topGainersLastHours.length; i++) {
        const token = topGainersLastHours[i].token;
        const currentPercentage = topGainersLastHours[i].priceChangePercentage
        const candles = await getLast10CandlesForCryptos(token)
        const currentPrice = (await getCurrentPriceOfTokens(token)).currentPrice

        const lastHourCandles = candles.slice(Math.max(0, 1))
        const last20Candles = candles.slice(Math.max(candles.length - 20, 1))
        const last10Candles = candles.slice(Math.max(candles.length - 10, 1))
        const last5Candles = candles.slice(Math.max(candles.length - 5, 1))

        const lastCandle = candles[candles.length - 1]
        var lastCandlePercentage = ((lastCandle[1] - lastCandle[0]) / lastCandle[0]) * 100
        lastCandlePercentage = (lastCandlePercentage).toLocaleString(
              undefined,
              { minimumFractionDigits: 2 }
            );

        const lastClosePriceHour = lastHourCandles[lastHourCandles.length - 1][1]
        const firstClosePriceHour = lastHourCandles[0][1]
        var priceChangeLastHour = ((lastClosePriceHour - firstClosePriceHour) / firstClosePriceHour) * 100
        priceChangeLastHour = (priceChangeLastHour).toLocaleString(
            undefined,
            { minimumFractionDigits: 2 }
          );

          const lastClosePrice20m = last20Candles[last20Candles.length - 1][1]
          const firstClosePrice20m = last20Candles[0][1]
          var priceChangeLast20m = ((lastClosePrice20m - firstClosePrice20m) / firstClosePrice20m) * 100
          priceChangeLast20m = (priceChangeLast20m).toLocaleString(
              undefined,
              { minimumFractionDigits: 2 }
            );

            const lastClosePrice10m = last10Candles[last10Candles.length - 1][1]
            const firstClosePrice10m = last10Candles[0][1]
            var priceChangeLast10m = ((lastClosePrice10m - firstClosePrice10m) / firstClosePrice10m) * 100
            priceChangeLast10m = (priceChangeLast10m).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              );
        
            const lastClosePrice5m = last5Candles[last5Candles.length - 1][1]
            const firstClosePrice5m = last5Candles[0][1]
            var priceChangeLast5m = ((lastClosePrice5m - firstClosePrice5m) / firstClosePrice5m) * 100
            priceChangeLast5m = (priceChangeLast5m).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              );

        var cardBg = '#222'
        if (priceChangeLast10m > 1.625 && priceChangeLast10m < 2.35) {
            cardBg = 'background-color: #222; border-color: #85bb65'
        } else if (priceChangeLast10m > 2.35 && priceChangeLast10m < 10.0) {
            cardBg = 'background-color: #366C1B; border-color: #85bb65'
        } else if (priceChangeLast10m >= 10) {
            cardBg = 'background-color: #222; border-color: #366C1B; transform: scale(1.2)'
        }

        var candlesHtml = ``
        for (let j = 0; j < last20Candles.length; j++) {
            var openPrice = last20Candles[j][0]
            var closePrice = last20Candles[j][1]
            var changePercentage = (closePrice - openPrice)
            var textClass = changePercentage > 0 ? 'green-text' : 'red-text'
            var iconClass = changePercentage > 0 ? 'fa-arrow-up' : 'fa-arrow-down'
            candlesHtml += `
            <div class="candleHolder ${textClass}">
                <i class="fa ${iconClass}" aria-hidden="true"></i>
            </div>

            `
        }

        cryptoCard = `
            <a href="https://www.binance.com/en/trade/${token}?type=spot" target="_blank">
            <div class="cryptoCard red-bg red-border" style="${cardBg}">
                <div class="cryptoTitle">
                    <h3>${token}</h3>
                    <div>
                        <small class="currentPrice">$${currentPrice}</small>
                        <label class="cryptoPercentage ${currentPercentage > 0 ? 'green-percentage' : 'red-percentage'}">
                            <i class="fa ${currentPercentage > 0 ? 'fa-arrow-up' : 'fa-arrow-down'}" aria-hidden="true"></i>
                            ${currentPercentage}%
                        </label>
                    </div>
                </div>
                <div class="last5Candles">
                    ${candlesHtml} [${lastCandlePercentage}%]
                </div>
                <div class="diffLast10Minutes">
                    <label class="cryptoPercentage ${priceChangeLastHour > 0 ? 'green-percentage' : 'red-percentage'}">
                        1H 
                        ${priceChangeLastHour}%
                    </label>
                    <label class="cryptoPercentage ${priceChangeLast10m > 0 ? 'green-percentage' : 'red-percentage'}">
                        10m
                        ${priceChangeLast10m}%
                    </label>
                    <label class="cryptoPercentage ${priceChangeLast5m > 0 ? 'green-percentage' : 'red-percentage'}">
                        5m
                        ${priceChangeLast5m}%
                    </label>
                </div>
            </div>
            </a>
            `;

        htmlTxt += cryptoCard 
    }
    monitor.innerHTML = htmlTxt
}
