(function () {
    'use strict';

    const https = require('https');
    const {URL} = require('url');
    const config = require('./config');
 
    function get(url) {
        return new Promise((resolve, reject) => {
            const urlOptions = new URL(url);
    
            const options = {
                host: urlOptions.host,
                path: urlOptions.pathname + urlOptions.search,
                headers: {
                    'Authorization': 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64')
                } 
            }

            https.get(options, (res) => {
                const { statusCode } = res;

                if (statusCode !== 200) {
                    reject({message: `HTTPS GET ${url} Status code is ${statusCode}`});
                }

                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);

                res.on('end', () => {
                    resolve(rawData);
                });
            }).on('error', (e) => {
                reject(e);
            });
        });
    }

    function post(url, body) {
        return new Promise((resolve, reject) => {
            const urlOptions = new URL(url);

            const postData = JSON.stringify(body);
    
            const options = {
                host: urlOptions.host,
                path: urlOptions.pathname + urlOptions.search,
                headers: {
                    'Authorization': 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64'),
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }

            const postReq = https.request(options, (res) => {
                const { statusCode } = res;

                if (statusCode !== 200) {
                    reject({message: `HTTPS GET ${url} Status code is ${statusCode}`});
                }

                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);

                res.on('end', () => {
                    resolve(rawData);
                });
            }).on('error', (e) => {
                reject(e);
            });

            postReq.write(postData);
            postReq.end();
        });
    }

    module.exports = {
        get: get,
        post: post
    };
})();
