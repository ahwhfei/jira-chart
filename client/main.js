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

            switch (chartType) {
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

        // return true means failure calling
        function fetchDataAndDrawChart() {
            showLoading();

            return fetch(`/jira`, {
                credentials: 'include'
            }).then(response => {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    hideLoading(null, true);
                    return true;
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
                hideLoading(null, true);
                return true;
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

        function hideLoading(updatedTime, isFailed) {
            _hideLoading();
            isFailed ? document.getElementById('updated-time').innerText = 'Bad request'
                : document.getElementById('updated-time').innerText = `Sync data at ${new Date(updatedTime).toLocaleString()}` || '';
        }

        function _hideLoading() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('container').style.display = 'block';
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
                fetchDataAndDrawChart().then(isFailed => {
                    isFailed && Cookies.remove('jql');
                });
            }
        }

        function onKeyDown(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }
        }

        function _configureSite() {
            chartType = viewType.configuration;
            _hideLoading();
            document.getElementById('container').innerHTML = `
            <div id="setting-container">
                <div class="setting-container-top">
                    <div>
                        <input type="checkbox" id="defaultJql">
                        <label for="defaultJql">Use Default Jql</label>
                    </div>

                    <div class="container">
                        <div class="row">
                            <div class="dropdown-container">
                                <div class="button-group">
                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                                        <span>Project</span>
                                        <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu" id="project-dropdown-menu">
                                        <li><a href="#" class="small" data-value="CC" tabIndex="-1"><input type="checkbox"/>CC</a></li>
                                        <li><a href="#" class="small" data-value="Athena" tabIndex="-1"><input type="checkbox"/>Athena</a></li>
                                        <li><a href="#" class="small" data-value="Studio" tabIndex="-1"><input type="checkbox"/>Studio</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div class="dropdown-container">
                                <div class="button-group">
                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                                        <span>Type</span>
                                        <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu" id="type-dropdown-menu">
                                        <li><a href="#" class="small" data-value="Epic" tabIndex="-1"><input type="checkbox"/>Epic</a></li>
                                        <li><a href="#" class="small" data-value="Story" tabIndex="-1"><input type="checkbox"/>Story</a></li>
                                        <li><a href="#" class="small" data-value="Bug" tabIndex="-1"><input type="checkbox"/>Bug</a></li>
                                        <li><a href="#" class="small" data-value="Task" tabIndex="-1"><input type="checkbox"/>Task</a></li>
                                        <li><a href="#" class="small" data-value="Sub-task" tabIndex="-1"><input type="checkbox"/>Sub-task</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div class="dropdown-container">
                                <div class="button-group">
                                    <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                                        <span>Status</span>
                                        <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu" id="status-dropdown-menu">
                                        <li><a href="#" class="small" data-value="Epic" tabIndex="-1"><input type="checkbox"/>Epic</a></li>
                                        <li><a href="#" class="small" data-value="Story" tabIndex="-1"><input type="checkbox"/>Story</a></li>
                                        <li><a href="#" class="small" data-value="Bug" tabIndex="-1"><input type="checkbox"/>Bug</a></li>
                                        <li><a href="#" class="small" data-value="Task" tabIndex="-1"><input type="checkbox"/>Task</a></li>
                                        <li><a href="#" class="small" data-value="Sub-task" tabIndex="-1"><input type="checkbox"/>Sub-task</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="jql-area">
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

            listenMenuClicked('#project-dropdown-menu a');
            listenMenuClicked('#type-dropdown-menu a');
            listenMenuClicked('#status-dropdown-menu a');
            
        }

        function listenMenuClicked(id) {
            var options = [];

            $(id).on('click', function (event) {

                var $target = $(event.currentTarget),
                    val = $target.attr('data-value'),
                    $inp = $target.find('input'),
                    idx;

                if ((idx = options.indexOf(val)) > -1) {
                    options.splice(idx, 1);
                    setTimeout(function () { $inp.prop('checked', false) }, 0);
                } else {
                    options.push(val);
                    setTimeout(function () { $inp.prop('checked', true) }, 0);
                }

                $( event.target ).blur();

                console.log(options);

                let projects = 'project in (';

                for (const item of options) {
                    projects += (item + ', ');
                }

                projects.replace(/,.*/i, ')');

                console.log(projects);

                return false;
            });
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
