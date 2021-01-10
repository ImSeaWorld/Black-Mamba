var WebSocketClient = require('websocket').client;
const client = new WebSocketClient();

client.on('connect', (con) => {
    console.log('Connected to live binance');

    con.on('error', (err) => {
        console.log('Connection error: ', err);
    });

    con.on('message', function(msg) {
        console.log(msg);
    });

    con.on('close', (code, desc) => {
        console.log(`Connection closed [${code}]: ${desc}`);
    });
});

client.connect(
    'wss://ws.coincap.io/prices?assets=handshake,bitcoin,ethereum,stellar',
);
