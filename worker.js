(function () {
    'use strict';
    const https = require('https');
    const d3 = require('d3-dsv');
    const _ = require('lodash');
    const xml2js = require('xml2js');
    const parseString = xml2js.parseString;
    const cache = require('memory-cache');
    const config = require('./config.json');

    let cachedData = [];

    function fetchJiraData(url, callback) {
        https.get(url, (res) => {
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);

            res.on('end', () => {
                callback(rawData);
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
    }

    function _getIssueList(data) {
        let rawData = d3.csvParse(data);
        let issueList = rawData.map(o => o['Issue key']);

        parseAllIssues(issueList);
    }

    function parseAllIssues(list) {
        const url = config.jiraXMLUrl;
        list.forEach(issue => {
            let issueUrl = `${url}/${issue}/${issue}.xml`;

            fetchJiraData(issueUrl, parseIssueXMLData);
        });
    }

    function parseIssueXMLData(data) {
        parseString(data, {
            explicitArray: false,
            trim: true
        }, (err, result) => {
            parseIssueJsonData(result);
        });
    }

    function isAvaiableStatus(v) {
        return config.AvaiableStatus.findIndex((s) => {
            return s.toLowerCase() === v.toLowerCase();
        }) >= 0;
    }

    function parseIssueJsonData(data) {
        const item = data.rss.channel.item;
        const subtasks = item.subtasks.subtask;

        if (subtasks) {

            let tasks = [];

            if (Array.isArray(subtasks)) {
                subtasks.forEach(o => {
                    tasks.push(o['_']);
                })
            } else {
                tasks.push(subtasks['_']);
            }

            parseAllIssues(tasks);
        }

        let issue = {};

        if (!isAvaiableStatus(item.status['_'])) {
            return;
        }

        let customFields = item.customfields.customfield;
        for (const c of customFields) {

            if (c['customfieldname'] === 'Planned Start' && c['customfieldvalues'] && c['customfieldvalues']['customfieldvalue']) {
                issue['Custom field (Planned Start)'] = c['customfieldvalues']['customfieldvalue'];
            }

            if (c['customfieldname'] === 'Planned End' && c['customfieldvalues'] && c['customfieldvalues']['customfieldvalue']) {
                issue['Custom field (Planned End)'] = c['customfieldvalues']['customfieldvalue'];
            }

            if (issue['Custom field (Planned Start)'] && issue['Custom field (Planned End)']) {
                break;
            }
        }

        issue['Issue key'] = item.key['_'];
        issue['Summary'] = item.summary;
        issue['Assignee'] = item.assignee['_'];
        issue['Status'] = item.status['_'];

        cachedData.push(issue);
    }

    function fetchEachIssue() {
        cachedData = [];

        const url = config.jiraUrl;

        fetchJiraData(url, _getIssueList);

        setTimeout(() => {
            if (cachedData && cachedData.length) {
                cache.put('cacached', _.cloneDeep(cachedData));
                console.log(`Fetched Data Count: ${cachedData.length} records at ${new Date()}`);
            }
        }, 20 * 1000);
    }

    function run() {
        fetchEachIssue();
    }

    (function () {
        run();

        setInterval(() => {
            run();
        }, config.fetchDataInterval * 1000);
    })();
})();
