(function () {
    'use strict';

    // Import dependencies
    let express = require('express'),
        router = express.Router();

    const cache = require('memory-cache');

    router.get('/', function (req, res) {
        res.send(cache.get('cacached'));
    });

    module.exports = router;
})();
