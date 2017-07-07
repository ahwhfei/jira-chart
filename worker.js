(function () {
    'use strict';
    const https = require('https');
    const d3 = require('d3-dsv');
    const _ = require('lodash');
    const xml2js = require('xml2js');
    const parseString = xml2js.parseString;
    const cache = require('memory-cache');

    let cachedData = [];    
    let cachedDataWithDone = [];

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
        const url = 'https://issues.citrite.net/si/jira.issueviews:issue-xml';
        list.forEach(issue => {
            let issueUrl = `${url}/${issue}/${issue}.xml`;

            fetchJiraData(issueUrl, parseIssueXMLData);
        });
    }

    function parseSingleIssue(issue) {
        const url = 'https://issues.citrite.net/si/jira.issueviews:issue-xml';
        let issueUrl = `${url}/${issue}/${issue}.xml`;

        fetchJiraData(issueUrl, parseIssueXMLData);
    }

    function parseIssueXMLData(data) {
        parseString(data, {
            explicitArray: false,
            trim: true
        }, (err, result) => {
            parseIssueJsonData(result);
        });
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

            tasks.forEach(t => {
                parseSingleIssue(t);
            });

        } else { // It is sub-task or It has no sub-task
            let issue = {};
            
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

            if (issue['Custom field (Planned Start)'] && issue['Custom field (Planned End)']) {
                issue['Issue key'] =  item.key['_'];
                issue['Summary'] = item.summary;
                issue['Assignee'] = item.assignee['_'];
                issue['Status'] = item.status['_'];

                cachedData.push(issue);
            }
        }
    }

    function fetchEachIssue() {
        cachedData = [];

        const url = 'https://issues.citrite.net/sr/jira.issueviews:searchrequest-csv-all-fields/temp/SearchRequest.csv?jqlQuery=project%20in%20(CC,ATH)%20AND%20(issuetype%20=%20Story%20AND%20labels%20=%20ReadyForImplementation%20OR%20issuetype%20in%20(Bug,%20Task))%20AND%20status%20in%20(planned,%20%22In%20progress%22,%20%22Pending%20pull%20request%22)%20AND%20labels%20=%20CWC_NJ_Team%20AND%20%22Planned%20Start%22%20is%20not%20empty%20and%20%22planned%20end%22%20is%20not%20empty%20ORDER%20BY%20status%20DESC,%20summary%20ASC,%20fixVersion%20ASC,%20rank%20ASC';

        fetchJiraData(url, _getIssueList);

        setTimeout(() => {
            cache.put('cacached', _.cloneDeep(cachedData));
            console.log(`Fetched Data Count: ${cachedData.length} records at ${new Date()}`);
        }, 20*1000);
    }

    let count = 0;
    (function() {
        setInterval(() => {
            fetchEachIssue();
        }, 10*60*1000);
    })(); 
})();
