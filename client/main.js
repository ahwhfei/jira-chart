let controller = 
(function () {
    'use strict';

    let cachedData = [];
    let cachedAllData = [];
    let isTaskView = true;

    function drawChart() {
        if (!cachedData || !cachedData.length) {
            return;
        }

        isTaskView ? drawTaskViewChart(cachedData) : drawUserViewChart(cachedAllData);
    }

    function fetchCachedDataAndDrawChart() {
        d3.json(`${manifest.host}/jiracached`, function (error, data) {
            console.log(data);

            if (error || !data || !data.length) {
                fetchDataAndDrawChart();
            } else {
                hideLoading();
                cachedAllData = data;
                cachedData = data.filter((d) => {
                    return d['Custom field (Planned End)'] 
                        && d['Custom field (Planned Start)']
                        && d['Custom field (Planned End)'] !== d['Custom field (Planned Start)'];
                });
                drawChart();
            }           
        })
    }

    function fetchDataAndDrawChart() {
        d3.csv(`${manifest.host}/jira?url=${manifest.jiraUrl}`, function (error, data) {
            console.log(data);
            hideLoading();
            cachedAllData = data;
            cachedData = data.filter((d) => {
                return d['Custom field (Planned End)'] 
                    && d['Custom field (Planned Start)']
                    && d['Custom field (Planned End)'] !== d['Custom field (Planned Start)'];
            });
            drawChart();
        });
    }

    function init() {
        fetchCachedDataAndDrawChart();

        window.addEventListener('resize', () => {
            drawChart();
        });

        window.setInterval(() => fetchCachedDataAndDrawChart(), 3600 * 1000);
    }

    function hideLoading() {
        let loading = document.getElementById('loading');
        loading && loading.parentNode.removeChild(loading);
    }

    init();

    return {
        changeView: () => {
            isTaskView = !isTaskView;
            drawChart();
        }, 
        forceFreshData: fetchDataAndDrawChart
    };
})();
