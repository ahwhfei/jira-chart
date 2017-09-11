(function () {
    'use strict';

    const settings = require('./backage-settings');
    const request = require('request').defaults({encoding: null});
    const cheerio = require('cheerio');
    const fs = require('fs');
    const path = require('path');

    let groupList = {};

    function parseHtml(html, user) {
        let currentPerson = {};
        let promiseList = [];
        
        const $ = cheerio.load(html, {
            ignoreWhitespace: true
        });

        const currentPersonElement = $('.bk-profile-image-src').children();
        currentPerson.id = user;
        currentPerson.name = currentPersonElement.attr('alt');
        let photo = currentPersonElement.attr('src');
        let photoPromise = fetchPhoto(photo);
        promiseList.push(photoPromise);
        
        photoPromise.then(image => {
            const filename = path.join(__dirname, `../client/photo/${currentPerson.id}.jpg`);
            fs.writeFile(filename, image, () => {});
        });
        currentPerson.photo = `${user}.jpg`;
        currentPerson.position = $('.bk-position').text();
        
        const contents = $('.bk-accordion-content');
        
        contents.each(function (index, element) {
            if ($(this).siblings().text().replace(/\s/g, '') === 'DirectReports') {
                currentPerson.directReports = [];
                const directReports = $(this).children();
                
                directReports.each(function (index, element) {
                    let person = {};
                    const linkElement = $(this).find('a').eq(1);
                    person.id = $(this).find('a').eq(1).attr('href');
                    person.name = $(this).find('a').eq(1).text();
                    person.position = $(this).find('span').last().text();
                    currentPerson.directReports.push(person);
                    
                    promiseList.push(fetchSingleProfile(person.id));
                    
                });
            }
        });

        groupList[user] = currentPerson;
        
        return Promise.all(promiseList);
    } 

    function fetchSingleProfile(user) {
        return new Promise((resolve, reject) => {

            getBackstageData(`${settings.profileUrl}${user}`).then(data => {
                parseHtml(data, user).then(() => resolve());
            });
        });
        
    }

    function getBackstageData(url) {
        return new Promise((resolve, reject) => {
            const options = {
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
                    'Cookie': settings.cookies,
                    'Accept': '/',
                    'Connection': 'keep-alive'
                }
            }
    
            request(options, (error, response, body) => {
                if (error) throw error;
    
                if (!response || response.statusCode !== 200) {
                    throw `Response status code ${response && response.statusCode}`;
                }
    
                resolve(body);
            });
        });
    }

    function fetchPhoto(path) {
        return getBackstageData(`${settings.host}${path}`);
    }

    fetchSingleProfile(settings.entry).then(() => {
        fs.writeFileSync('orgList.json', JSON.stringify(groupList), ()=>{});
        console.log('DONE');
    }).catch(error => {
        console.log(error)
    });
})();
