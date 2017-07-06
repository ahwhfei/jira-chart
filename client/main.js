let controller = 
(function () {
    'use strict';

    let cachedData = [];
    let isTaskView = true;
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html((d) => {
            return `<strong>${d['Assignee']}</strong>
                    <span>(${d['Custom field (Planned Start)']} - ${d['Custom field (Planned End)']})</span>
                    <span>${d['Status']}</span>
                    <br/>
                    <span>${d['Issue key']} ${d['Summary']}</span>`;    
        });

    function minDate() {
        let minOfPlannedStart;
        let minOfPlannedEnd;

        //Planned Start
        cachedData.forEach((o, i) => {
            if (minOfPlannedStart === undefined) {
                minOfPlannedStart = i;
            }

            if (o['Custom field (Planned Start)']
                && new Date(o['Custom field (Planned Start)']) < new Date(cachedData[minOfPlannedStart]['Custom field (Planned Start)'])) {
                minOfPlannedStart = i;
            }
        });

        //Planned End
        cachedData.forEach((o, i) => {
            if (minOfPlannedEnd === undefined) {
                minOfPlannedEnd = i;
            }

            if (o['Custom field (Planned End)']
                && new Date(o['Custom field (Planned End)']) < new Date(cachedData[minOfPlannedEnd]['Custom field (Planned End)'])) {
                minOfPlannedEnd = i;
            }
        });

        if (minOfPlannedStart === undefined) {
            return cachedData[minOfPlannedEnd] && cachedData[minOfPlannedEnd]['Custom field (Planned End)'];
        } else if (minOfPlannedEnd === undefined) {
            return cachedData[minOfPlannedStart] && cachedData[minOfPlannedStart]['Custom field (Planned Start)'];
        } else if (new Date(cachedData[minOfPlannedStart]['Custom field (Planned Start)']) < new Date(cachedData[minOfPlannedEnd]['Custom field (Planned End)'])) {
            return cachedData[minOfPlannedStart]['Custom field (Planned Start)'];
        } else {
            return cachedData[minOfPlannedEnd]['Custom field (Planned End)'];
        }
    }

    function maxDate() {
        let maxOfPlannedStart;
        let maxOfPlannedEnd;

        //Planned Start
        cachedData.forEach((o, i) => {
            if (maxOfPlannedStart === undefined) {
                maxOfPlannedStart = i;
            }

            if (o['Custom field (Planned Start)']
                && new Date(o['Custom field (Planned Start)']) > new Date(cachedData[maxOfPlannedStart]['Custom field (Planned Start)'])) {
                maxOfPlannedStart = i;
            }
        });

        //Planned End
        cachedData.forEach((o, i) => {
            if (maxOfPlannedEnd === undefined) {
                maxOfPlannedEnd = i;
            }

            if (o['Custom field (Planned End)']
                && new Date(o['Custom field (Planned End)']) > new Date(cachedData[maxOfPlannedEnd]['Custom field (Planned End)'])) {
                maxOfPlannedEnd = i;
            }
        });

        if (maxOfPlannedStart === undefined) {
            return cachedData[maxOfPlannedEnd] && cachedData[maxOfPlannedEnd]['Custom field (Planned End)'];
        } else if (maxOfPlannedEnd === undefined) {
            return cachedData[maxOfPlannedStart] && cachedData[maxOfPlannedStart]['Custom field (Planned Start)'];
        } else if (new Date(cachedData[maxOfPlannedStart]['Custom field (Planned Start)']) > new Date(cachedData[maxOfPlannedEnd]['Custom field (Planned End)'])) {
            return cachedData[maxOfPlannedStart]['Custom field (Planned Start)'];
        } else {
            return cachedData[maxOfPlannedEnd]['Custom field (Planned End)'];
        }
    }

    function drawTaskViewChart() {
        document.getElementById('figure').innerHTML = '';

        const margin = { top: 50, right: 50, bottom: 50, left: 80 };
        let barHeight = 15;
        const barPadding = 5;
        let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
        let height = cachedData.length * (barHeight + barPadding);

        if (width <= 0) {
            width = 800;
        }

        if (height <= 0) {
            height = 500;
        }

        if ((height > (window.innerHeight - 80 - margin.top - margin.bottom)) && height < 1200) {
            let _height = window.innerHeight - 80 - margin.top - margin.bottom - 10;
            let _barHeight = _height/cachedData.length - barPadding;

            if (_barHeight >= 7) {
                height = _height;
                barHeight = _barHeight;
            }
        }

        const lowDate = new Date(minDate());
        const topDate = new Date(maxDate());

        if (lowDate == 'Invalid Date' || topDate == 'Invalid Date') {
            console.error('Invalid Data');
            return;
        }

        lowDate.setDate(lowDate.getDate() - 10);
        topDate.setDate(topDate.getDate() + 10);

        let xScale = d3.time.scale()
            .domain([lowDate, topDate])
            .range([20, width]);

        let yScale = d3.scale.ordinal()
            .domain(cachedData.map((element) => element['Issue key']))
            .rangeRoundBands([0, height], '.1');

        let svg = d3.select('#figure')
            .append('svg')
            .attr('class', 'svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right);

        svg.call(tip);

        let xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickSize(-height)
            .outerTickSize(0)
            .tickFormat(d3.time.format('%d %b'));

        let yAxis = d3.svg.axis()
            .scale(yScale)
            .tickSize(-width)
            .orient('left')


        svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .call(xAxis)

        svg.append('g')
            .attr('class', 'yaxis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(yAxis)

        svg.select('.yaxis')
            .selectAll('text')
            .style("cursor", "pointer")
            .on('click', (d) => {
                window.open('https://issues.citrite.net/browse/' + d, '_blank');
            })


        let color = d3.scale.category20();

        svg.selectAll('.rect')
            .data(cachedData)
            .enter()
            .append('rect')
            .attr('class', 'rect')
            .attr('fill', (d, i) => { return color(i); })
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('x', (d) => {
                if (d['Custom field (Planned Start)']) {
                    return xScale(new Date(d['Custom field (Planned Start)']));
                }
                return xScale(new Date());
            })
            .attr('y', (d) => {
                return yScale(d['Issue key']);
            })
            .attr('width', 0)
            .attr('height', barHeight)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .duration(1000)
            .attr('width', (d) => {
                return xScale(new Date(d['Custom field (Planned End)'])) - xScale(new Date(d['Custom field (Planned Start)']));
            })

        svg.append('line')
            .attr('class', 'current-line')
            .attr('y2', height)
            .attr('x2', 0)
            .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')')

    }

    function drawUserViewChart() {
        document.getElementById('figure').innerHTML = '';

        const margin = { top: 50, right: 50, bottom: 50, left: 80 };
        let barHeight = 15;
        const barPadding = 5;
        let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
        let height = cachedData.length * (barHeight + barPadding);

        if (width <= 0) {
            width = 800;
        }

        if (height <= 0) {
            height = 500;
        }

        if ((height > (window.innerHeight - 80 - margin.top - margin.bottom)) && height < 1200) {
            let _height = window.innerHeight - 80 - margin.top - margin.bottom - 10;
            let _barHeight = _height/cachedData.length - barPadding;

            if (_barHeight >= 7) {
                height = _height;
                // barHeight = _barHeight;
            }
        }

        const lowDate = new Date(minDate());
        const topDate = new Date(maxDate());

        if (lowDate == 'Invalid Date' || topDate == 'Invalid Date') {
            console.error('Invalid Data');
            return;
        }

        lowDate.setDate(lowDate.getDate() - 10);
        topDate.setDate(topDate.getDate() + 10);

        let xScale = d3.time.scale()
            .domain([lowDate, topDate])
            .range([20, width]);

        let yScale = d3.scale.ordinal()
            .domain(cachedData.map((element) => element['Assignee']))
            .rangeRoundBands([0, height], '.1');

        let svg = d3.select('#figure')
            .append('svg')
            .attr('class', 'svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right);

        svg.call(tip);

        let xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickSize(-height)
            .outerTickSize(0)
            .tickFormat(d3.time.format('%d %b'));

        let yAxis = d3.svg.axis()
            .scale(yScale)
            .tickSize(-width)
            .orient('left')


        svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .call(xAxis)

        svg.append('g')
            .attr('class', 'yaxis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(yAxis)

        // svg.select('.yaxis')
        //     .selectAll('text')
        //     .style("cursor", "pointer")
        //     .on('click', (d) => {
        //         window.open('https://issues.citrite.net/browse/' + d, '_blank');
        //     })

        let color = d3.scale.category20();

        svg.selectAll('.rect')
            .data(cachedData)
            .enter()
            .append('rect')
            .attr('class', 'rect')
            .attr('fill', (d, i) => { return color(i); })
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('x', (d) => {
                if (d['Custom field (Planned Start)']) {
                    return xScale(new Date(d['Custom field (Planned Start)']));
                }
                return xScale(new Date());
            })
            .attr('y', (d) => {
                return yScale(d['Assignee']) + (barHeight/2);
            })
            .attr('width', 0)
            .attr('height', barHeight)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .duration(1000)
            .attr('width', (d) => {
                return xScale(new Date(d['Custom field (Planned End)'])) - xScale(new Date(d['Custom field (Planned Start)']));
            })

        svg.append('line')
            .attr('class', 'current-line')
            .attr('y2', height)
            .attr('x2', 0)
            .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')')
    }

    function drawChart() {
        if (!cachedData || !cachedData.length) {
            return;
        }

        isTaskView ? drawTaskViewChart() : drawUserViewChart();
    }

    function fetchDataAndDrawChart() {
        d3.csv(`${manifest.host}/jira?url=${manifest.jiraUrl}`, function (error, data) {
            hideLoading();
            cachedData = data;
            console.log(cachedData);
            drawChart();
        });
    }

    function init() {
        fetchDataAndDrawChart();

        window.addEventListener('resize', () => {
            drawChart();
        });

        window.setInterval(() => fetchDataAndDrawChart(), 3600 * 1000);
    }

    function hideLoading() {
        let loading = document.getElementById('loading');
        loading.parentNode.removeChild(loading);
    }

    init();

    return {
        changeView: () => {
            isTaskView = !isTaskView;
            drawChart();
        }
    };
})();
