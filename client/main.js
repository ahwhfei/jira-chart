let controller = 
(function () {
    'use strict';

    let cachedData = [];
    let viewType = {
        task: 'task',
        assignee: 'assignee',
        developer: 'developer',
        configuration: 'configuration'
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
            
            if (!d[DATAFIELDS.developers] || (d[DATAFIELDS.subtask] && d[DATAFIELDS.subtask].length)) {
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

        fetch(`/jiracached`).then(response => {
            if (response.status !== 200) {
                fetchDataAndDrawChart();
                return;
            }

            response.json().then(res => {
                console.table(res.data);
                const updatedTime = res.updatedTime;
                hideLoading(updatedTime);
                cachedData = res.data;
                drawChart();
            });
        }).catch(err => {
            console.error(err);
            fetchDataAndDrawChart();
        });
    }

    function fetchDataAndDrawChart() {
        showLoading();

        fetch(`/jira`).then(response => {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }

            response.json().then(res => {
                console.table(res.data);
                const updatedTime = res.updatedTime;
                hideLoading(updatedTime);
                cachedData = res.data;
                drawChart();
            });
        }).catch(err => {
            console.error(err);
        });
    }

    function init() {
        if (Cookies.get('jql')) {
            fetchDataAndDrawChart();
        } else {
            fetchCachedDataAndDrawChart();
        }

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

    function hideLoading(updatedTime) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('container').style.display = 'block';
        document.getElementById('updated-time').innerText = `Sync data at ${new Date(updatedTime).toLocaleString()}` || '';
        document.getElementById('sync-data-btn').removeAttribute('disabled');
    }

    function showLoading() {
        console.log('loading...');
        document.getElementById('sync-data-btn').setAttribute('disabled', 'disabled');
        document.getElementById('updated-time').innerText = 'Loading...';
    }

    function onKeyUp(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            const textbox = document.getElementById('jql-textbox');
            Cookies.put('jql', textbox.value);
            fetchDataAndDrawChart();
        }
    }

    function onKeyDown(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    function _configureSite() {
        chartType = viewType.configuration;
        document.getElementById('container').innerHTML = `
            <div id="setting-container">
                <div class="jql-area">
                    <div>
                        <input type="checkbox" id="defaultJql">
                        <label for="defaultJql">Use Default Jql</label>
                    </div>
                    <textarea id="jql-textbox"></textarea>
                </div>
            </div>
        `;

        const textbox = document.getElementById('jql-textbox');
        textbox.addEventListener('keyup', onKeyUp);
        textbox.addEventListener('keydown', onKeyDown);

        const defaultJqlCheckbox = document.getElementById('defaultJql');
        defaultJqlCheckbox.addEventListener('change', onChangeTextBoxStatus);
        if (hasJqlCookie()) {
            defaultJqlCheckbox.checked = false;
            textbox.value = Cookies.get('jql');
        } else {
            _getJql().then(jql => {
                textbox.value = jql;
            });
            defaultJqlCheckbox.checked = true;
        }

        textbox.disabled = defaultJqlCheckbox.checked;        

        function onChangeTextBoxStatus(event) {
            textbox.disabled = defaultJqlCheckbox.checked;
            if (defaultJqlCheckbox.checked) {
                Cookies.remove('jql');

                fetchCachedDataAndDrawChart(); 

                _getJql().then(jql => {
                    textbox.value = jql;
                });
            }
        }
    }

    

    function hasJqlCookie() {
        return !!Cookies.get('jql');
    }

    function _getJql() {
        return fetch('/jql').then(response => {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }

            return response.text().then(data => {
                return data;
            })
        }).catch(err => {
            console.error(err);
        });
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
