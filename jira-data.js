(function () {
    'use strict';

    const request = require('request').defaults({encoding: null});
    const config = require('./config');
    const DATAFIELDS = require('./data-field');
    const httpsClient = require('./https-client');

    

    function callJiraApi() {
        let rawData = [];

        function _callSearchApi(startAt) {
            let url = `${config.jiraSearchApi}`;
            const parameters = {
                jql: config.jiraJql,
                startAt: startAt,
                maxResults: config.jiraMaxResults,
                fields: config.jiraFields
            }

            return httpsClient.post(url, parameters)
                .then(body => {
                    const data = JSON.parse(body);

                    if (data.issues.length > 0) {
                        rawData.push(...data.issues);
                    }

                    if (startAt + data.issues.length < data.total) {
                        return _callSearchApi(startAt + data.issues.length);
                    } else {
                        return rawData;
                    }
                }).catch(error => {
                    console.log(error);
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

        return httpsClient.get(`${config.jiraIssueApi}${key}`)
            .then(body => {
                const issue = JSON.parse(body);
                return getValues(issue);
            }).catch(error => {
                console.log(error);
            });
    }

    function formatData(data) {
        let prettyData = [];

        for (const d of data) {
            const c = getValues(d);

            prettyData.push(c);
        }

        return prettyData;
    }

    function getJiraData(source) {
        return callJiraApi().then(rawData => {
            const data = formatData(rawData);
            
            source && console.log(`Source: ${source} Record: ${data.length} at ${new Date().toLocaleString()}`);
            return data;
        })
    }

    module.exports = {
        get: getJiraData
    };
})();
