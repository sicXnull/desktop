const request = require('request');

function fetch(coin) {
    let coinId = null;

    if (coin === 'posq') {
        coinId = 3441;
    }

    return new Promise((res, rej) => {
        request.get(`https://coinlib.io/api/v1/coin?key=25517591efe6bd7f&pref=USD&symbol=POSQ`, (error, response, body) => {
            if (error) {
                return rej(error);
            }
            const json = JSON.parse(body);
            return res({ usd: json.price });
        });
    });
}

exports.fetch = fetch;
