(function () {
    'use strict';
    const https = require('https');
    const {URL} = require('url');
    const d3 = require('d3-dsv');
    const xml2js = require('xml2js');
    const parseString = xml2js.parseString;
    
    const config = require('./config');
    const httpsClient = require('./https-client');

    let cachedData = [];
    let isDateIntegrity = true;

    console.log(`XML Worker PID #${process.pid} at ${new Date().toLocaleString()}`);

    function _getIssueList(data) {
        let rawData = d3.csvParse(data);
        let issueList = rawData.map(o => o['Issue key']);

        return parseAllIssues(issueList);
    }

    function parseAllIssues(list) {
        const url = config.jiraXMLUrl;
        let promiseList = [];

        list.forEach(issue => {
            let issueUrl = `${url}/${issue}/${issue}.xml`;

            let p = httpsClient.get(issueUrl).then(data => {
                return parseIssueXMLData(data);
            }).catch(err => {
                isDateIntegrity = false;
                console.log(err.message);
            });

            promiseList.push(p);
        });

        return Promise.all(promiseList);
    }

    function parseIssueXMLData(data) {
        return new Promise(resolve => {
            parseString(data, {
                explicitArray: false,
                trim: true
            }, (err, result) => {
                parseIssueJsonData(result).then(() => {
                    resolve();
                }).catch(err => {
                    isDateIntegrity = false;
                    reject(err);
                });
            });
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

        let promise;
        let issue = {};

        // The issue has sub-task field
        if (subtasks) {
            let tasks = [];

            if (Array.isArray(subtasks)) {
                subtasks.forEach(o => {
                    tasks.push(o['_']);
                })
            } else {
                tasks.push(subtasks['_']);
            }
            
            issue['Subtask'] = tasks;

            promise = parseAllIssues(tasks);
        }

        if (!isAvaiableStatus(item.status['_'])) {
            return promise || Promise.resolve();
        }

        let customFields = item.customfields.customfield;
        // Set 'Planned Start/End' field
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

        // Set 'Developers' field
        for (const c of customFields) {
            if (c['customfieldname'] === 'Developers' && c['customfieldvalues'] && c['customfieldvalues']['customfieldvalue']) {
                let developers = c['customfieldvalues']['customfieldvalue'];
                if (Array.isArray(developers)) {
                    issue['Developers'] = [... developers];
                } else if (developers !== item.assignee['$']['username']) {
                    issue['Developers'] = [];
                    issue['Developers'].push(developers);
                }
                break;
            }
        }

        // Set general fields
        issue['Issue key'] = item.key['_'];
        issue['Summary'] = item.summary;
        issue['Assignee'] = item.assignee['$']['username'];
        issue['Status'] = item.status['_'];
        issue['Issue Type'] = item.type['_'];
        issue['Priority'] = item.priority['_'];

        if (cachedData.findIndex(e => e['Issue key'] === issue['Issue key']) === -1) {
            cachedData.push(issue);
        }

        return promise || Promise.resolve();
    }

    function run() {
        cachedData = [];
        isDateIntegrity = true;

        const url = config.jiraUrl;
        
        httpsClient.get(url).then(data => {
            return _getIssueList(data);
        }).then(() => {
            if (isDateIntegrity && cachedData && cachedData.length) {
                console.log(`XML worker Fetched Data Count: ${cachedData.length} records at ${new Date().toLocaleString()}`);
                // process.send(cachedData);
            }

            setTimeout(() => run(), config.fetchDataInterval * 1000);
        }).catch((err) =>{
            console.error(`Exception: ${err.message} at ${new Date()}`);
            
            setTimeout(() => run(), config.fetchDataInterval * 1000);
        });
    }

    run();
})();
