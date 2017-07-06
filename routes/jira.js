(function () {
    'use strict';

    // Import dependencies
    let express = require('express'),
        router = express.Router();

    const https = require('https');

    router.get('/', function (req, response) {
        const url = req.query['url'];
        console.log(url);
        https.get(url, (res) => {
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);

            res.on('end', () => {
                response.send(rawData);
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
    });

    module.exports = router;
})();
