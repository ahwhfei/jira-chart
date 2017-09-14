(function () {
    'use strict';

    const request = require('request').defaults({encoding: null});
    const config = require('./config');
    const DATAFIELDS = require('./data-field');

    let prettyData = [];

    function callJiraApi() {
        let rawData = [];

        function _callSearchApi(startAt) {
            return new Promise((resolve, reject) => {
                request.get(config.jiraSearchApi, {
                    qs: {
                        jql: config.jiraJql,
                        startAt: startAt,
                        maxResults: config.jiraMaxResults,
                        fields: '*all'
                    }
                }, (error, response, body) => {
                    if (error || response.statusCode !== 200) {
                        console.log(error || `Response Status code ${response.statusCode}`);
                        reject();
                    }
        
                    try {
                        const data = JSON.parse(body);
    
                        if (data.issues.length > 0) {
                            rawData.push(...data.issues);
                        }
    
                        if (startAt + data.issues.length < data.total) {
                            _callSearchApi(startAt + data.issues.length).then(() => resolve());
                        } else {
                            resolve(rawData);
                        }
                    } catch (error) {
                        console.log(error);
                        reject();
                    }
                });
            });
        }

        return _callSearchApi(0);
    }

    function getValues(d) {
        let c = {};

        c[DATAFIELDS.assignee] = d.fields.assignee && d.fields.assignee.name;
        c[DATAFIELDS.developers] = d.fields['customfield_21049'] && d.fields['customfield_21049'].map((developer) => developer.name);
        c[DATAFIELDS.status] = d.fields.status && d.fields.status.name;
        c[DATAFIELDS.issueKey] = d.key;
        c[DATAFIELDS.issueType] = d.fields.issuetype && d.fields.issuetype.name;
        // c[DATAFIELDS.photo]
        c[DATAFIELDS.plannedStart] = d.fields['customfield_17632'];
        c[DATAFIELDS.plannedEnd] = d.fields['customfield_17633'];
        c[DATAFIELDS.priority] = d.fields.priority && d.fields.priority.name;
        c[DATAFIELDS.status] = d.fields.status && d.fields.status.name;
        c[DATAFIELDS.subtask] = d.fields.subtasks &&  d.fields.subtasks.map(task => task.key);
        c[DATAFIELDS.summary] = d.fields.summary;

        return c;
    }

    function getJiraIssue(key) {
        return new Promise((resolve, reject) => {
            request.get(`${config.jiraIssueApi}${key}`, (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    reject(error || `Response Status code ${response.statusCode}`);
                }

                try {
                    const issue = JSON.parse(body);
                    const s = getValues(issue);

                    resolve(s);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    function formatData(data) {
        let promiseList = [];

        prettyData = [];

        for (const d of data) {
            const c = getValues(d);

            prettyData.push(c);

            if (!d.fields.subtasks || !d.fields.subtasks.length) {
                continue;
            }
                
            for (const t of d.fields.subtasks) {
                const p = getJiraIssue(t.key).then(issue => prettyData.push(issue));

                promiseList.push(p);
            }       
        }

        return Promise.all(promiseList).then(() => prettyData);
    }

    function run() {
        prettyData = [];

        callJiraApi().then((rawData) => {
            formatData(rawData).then((data) => {
                console.log(`2/2 Fetched Data Count: ${prettyData.length} records at ${new Date().toLocaleString()}`);
                process.send(prettyData);
                setTimeout(() => run(), config.fetchDataInterval * 1000);
            });

            // console.log(`1/2 Fetched Data Count: ${prettyData.length} records at ${new Date().toLocaleString()}`);       
            // process.send(prettyData);
        }).catch(error => {
            console.log(error);
            setTimeout(() => run(), config.fetchDataInterval * 1000);
        });
    }

    run();
})();
