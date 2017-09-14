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
            
            if (!d[DATAFIELDS.developers] || (d[DATAFIELDS.subtask] && !d[DATAFIELDS.subtask].length)) {
                continue;
            }

            for (const f of d[DATAFIELDS.developers]) {
                if (f !== d[DATAFIELDS.assignee]) {
                    let o = _.cloneDeep(d);
                    o[DATAFIELDS.originalAssignee] = o[DATAFIELDS.assignee];
                    delete o[DATAFIELDS.assignee];
                    o[DATAFIELDS.assignee] = f;
                    o[DATAFIELDS.isDeveloper] = true;
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
        d3.json('/jiracached', function (error, data) {
            console.table(data);

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
        d3.csv(`/jira?url=${manifest.jiraUrl}`, function (error, data) {
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
        document.getElementById('container').style.display = 'block';
    }

    function _configureSite() {
        console.log('xxxx')
        // document.getElementById('container').innerHTML = '';
    }

    init();

    return {
        showTaskView: _showTaskView, 
        forceFreshData: fetchDataAndDrawChart,
        showAssigneeView: _showAssigneeView,
        showAssigneeAndDeveloperView: _showUserViewWithDeveloper,
        configureSite: _configureSite
    };
})();
