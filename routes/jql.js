(function () {
    'use strict';

    // Import dependencies
    let express = require('express'),
        router = express.Router();

    const jiraData = require('../jira-data');
    const cache = require('memory-cache');
    const config = require('../config');

    router.get('/', function (req, response) {
        response.send(config.jiraJql);
    });

    module.exports = router;
})();
