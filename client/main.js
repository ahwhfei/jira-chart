let controller = 
(function () {
    'use strict';

    let cachedData = [];
    let viewType = {
        task: 'task',
        assignee: 'assignee',
        developer: 'developer'
    };
    let chartType = viewType.task;

    function drawChart() {
        if (!cachedData || !cachedData.length) {
            return;
        }

        switch(chartType) {
            case viewType.task:
                drawTaskViewChart(cachedData);
                break;
            case viewType.assignee:
                drawUserViewChart(cachedData);
                break;
            case viewType.developer:
                _showUserViewWithDeveloper();
                break;
            default:
                break;
        }
    }

    function _showAssigneeView() {
        chartType = viewType.assignee;
        drawChart();
    }

    function _showTaskView() {
        chartType = viewType.task;
        drawChart();
    }

    function flatDeveloperToAssignee() {
        let cachedFlattenDeveloperData = [];

        for (const d of cachedData) {
            cachedFlattenDeveloperData.push(d);
            
            if (!d['Developers']) {
                continue;
            }

            for (const f of d['Developers']) {
                if (f !== d['Assignee']) {
                    let o = _.cloneDeep(d);
                    o['OrignalAssignee'] = o['Assignee'];
                    delete o['Assignee'];
                    o['Assignee'] = f;
                    o['IsDevelop'] = true;
                    cachedFlattenDeveloperData.push(o);
                }
            }
        }

        // console.log(cachedFlattenDeveloperData)

        return cachedFlattenDeveloperData;
    }

    function _showUserViewWithDeveloper() {
        chartType = viewType.developer;
        let data = flatDeveloperToAssignee();
        drawUserViewChart(data);
    }

    function fetchCachedDataAndDrawChart() {
        d3.json(`${manifest.host}/jiracached`, function (error, data) {
            console.log(data);

            if (error || !data || !data.length) {
                fetchDataAndDrawChart();
            } else {
                hideLoading();
                cachedData = data;
                drawChart();
            }           
        })
    }

    function fetchDataAndDrawChart() {
        d3.csv(`${manifest.host}/jira?url=${manifest.jiraUrl}`, function (error, data) {
            console.log(data);
            hideLoading();
            cachedData = data;
            drawChart();
        });
    }

    function init() {
        fetchCachedDataAndDrawChart();

        window.addEventListener('resize', () => {
            drawChart();
        });

        window.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.code === 'KeyF') {
                fetchDataAndDrawChart();
            }
        })

        window.setInterval(() => fetchCachedDataAndDrawChart(), 3600 * 1000);
    }

    function hideLoading() {
        let loading = document.getElementById('loading');
        loading && loading.parentNode.removeChild(loading);
    }

    init();

    return {
        showTaskView: _showTaskView, 
        forceFreshData: fetchDataAndDrawChart,
        showAssigneeView: _showAssigneeView,
        showAssigneeAndDeveloperView: _showUserViewWithDeveloper
    };
})();
