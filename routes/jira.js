(function () {
    'use strict';

    // Import dependencies
    let express = require('express'),
        router = express.Router();

    const jiraData = require('../jira-data');
    const cache = require('memory-cache');

    router.get('/', function (req, response) {
        jiraData.get(req.ip).then(data => {
            const value = {updatedTime: new Date(), data: data};
            cache.put('cacached', value);
            response.send(value);
        }).catch(() => response.send(null));
    });

    module.exports = router;
})();
