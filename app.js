(function(){
    'use strict';

    var express = require('express'),
        path = require('path'),
        app = express(),
        cors = require('cors'),
        jira = require('./routes/jira');

    // Enable cross domain GET requests
    app.use(cors({
        'methods': 'GET'
    }));

    app.use(express.static(path.join(__dirname, 'client')));

    app.use('/jira', jira);

    // For resolve Angular enable HTML5 mode page refresh without 404 error
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/index.html'));
    });

    module.exports = app;
}());