const CoinGecko = require('coingecko-api');
const name = "poseidon-quark"

function fetch(coin) {
    const client = new CoinGecko();
    return client.coins.fetch(name).then(data => {
        const result = {
            usd: data.data.market_data.current_price.usd
        };
        return result;
    });
}

exports.fetch = fetch;
