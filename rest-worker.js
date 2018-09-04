(function () {
    'use strict';

    const jiraData = require('./jira-data');
    const config = require('./config');

    console.log(`REST Worker PID #${process.pid} at ${new Date().toLocaleString()}`);

    function run() {
        jiraData.get().then((data) => {
            console.log(`REST worker Fetched Data Count: ${data.length} records at ${new Date().toLocaleString()}`);
            process.send(data);
            setTimeout(() => run(), config.fetchDataInterval * 1000);
        }).catch(error => {
            console.log(error);
            setTimeout(() => run(), config.fetchDataInterval * 1000);
        });
    }

    run();
})()
