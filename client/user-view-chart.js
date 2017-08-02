function drawUserViewChart(cachedData) {
    'use strict';
 
    const margin = { top: 0, right: 50, bottom: -2, left: 150 };
    const barPadding = 5;
    const axisFontHeight = 17;
    const minBarHeight = 4;
    const minBarPadding = 2;

    let assigneeList = [];
    const [width, height, barHeight] = _determineWidthHeight();
    const [lowDate, topDate] = _determineXAxisLimit();
    const [xScale, yScale] = _createXYScale();
    const [xAxis, yAxis] = _createXYAxis();

    function _determineXAxisLimit() {
        let dataWithDate = cachedData.filter(d => users[d[DATAFIELDS.assignee]] && (d[DATAFIELDS.plannedEnd] || d[DATAFIELDS.plannedStart]));
        let lowDate = new Date(minDate(dataWithDate));
        let topDate = new Date(maxDate(dataWithDate));

        if (lowDate == 'Invalid Date' || topDate == 'Invalid Date') {
            console.error('Invalid Data');
            return;
        }

        lowDate.setDate(lowDate.getDate() - 10);
        topDate.setDate(topDate.getDate() + 10);
        
        return [lowDate, topDate];
    }

    function _createXYScale() {
        let xScale = d3.time.scale()
            .domain([lowDate, topDate])
            .range([20, width]);

        let yScale = d3.scale.ordinal()
            .domain(assigneeList)
            .rangeRoundBands([0, height], '.1');

        return [xScale, yScale];
    }

    function _createSvg() {
        document.getElementById('figure').innerHTML = '';

        return d3.select('#figure')
            .append('svg')
            .attr('class', 'svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right);
    }

    function _determineWidthHeight() {
        let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
        let height = ChartHeight().get();
        let barHeight = 24;

        if (width < 200) {
            width = 200;
        }

        if (height <= 0) {
            height = 500;
        }

        for (const e in users) {
            assigneeList.push(e);
        }

        barHeight = height / assigneeList.length - barPadding;

        const maxCount = maxCountOfTasksByPerson();

        if (barHeight/maxCount < (minBarHeight + minBarPadding)) {
            barHeight = (minBarHeight + minBarPadding) * maxCount;
            height = (barHeight + barPadding)*assigneeList.length;
        }

        return [width, height, barHeight];
    }    

    function maxCountOfTasksByPerson() {
        let max = 0;

        for (const d of cachedData) {
            let count = cachedData.filter(o => {
                return o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]
                    && o[DATAFIELDS.plannedStart]
                    && o[DATAFIELDS.plannedEnd]
            }).length;

            if (count > max) {
                max = count;
            }
        }

        return max;
    }    

    function _initTooltip(svg) {
        svg.call(tip);
    }

    function _createXYAxis() {
        let xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(d3.time.weeks, 2)
            .tickSize(-height)
            .outerTickSize(0)
            .tickFormat(d3.time.format('%d %b'));

        let yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .tickFormat(d => users[d] ? users[d] : d);

        return [xAxis, yAxis];
    }

    function _drawAxisZebra(svg) {
        svg.append('g')
            .attr('class', 'axis-rect-zebra')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .selectAll('.axis-rect')
            .data(assigneeList)
            .enter()
            .append('rect')
            .attr('class', 'axis-rect')
            .attr('fill', (d, i) => i % 2 === 0 ? '#EEE' : '#E7E7E7')
            .attr('x', d => xScale(lowDate)-margin.left)
            .attr('y', d => yScale(d))
            .attr('width', xScale(topDate)+margin.left)
            .attr('height', barHeight+barPadding);
    }

    function _drawXYAxis(svg) {
        svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .call(xAxis);

        svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(customerYAxis);
    }

    function customerYAxis(g) {
        let offset = (barHeight + barPadding) / 2;
        g.call(yAxis);
        g.select(".domain").remove();
    }

    function _drawUserDataBar(svg) {
        let color = d3.scale.category20();

        svg.append('g')
            .attr('class', 'rect')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .selectAll('.rect')
            .data(cachedData.filter(d => d[DATAFIELDS.plannedEnd] && d[DATAFIELDS.plannedStart] && users[d[DATAFIELDS.assignee]]))
            .enter()
            .append('rect')
            .attr('fill', (d, i) => {
                let index = cachedData.findIndex(o => o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]);
                return color(index);
            })
            .attr('x', (d) => {
                if (d[DATAFIELDS.plannedStart]) {
                    return xScale(new Date(d[DATAFIELDS.plannedStart]));
                }
            })
            .attr('y', (d) => {
                let listByAssignee = cachedData.filter(o => {
                    return o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]
                        && o[DATAFIELDS.plannedStart]
                        && o[DATAFIELDS.plannedEnd]
                });
                let index = listByAssignee.findIndex(o => o[DATAFIELDS.issueKey] === d[DATAFIELDS.issueKey]);
                return yScale(d[DATAFIELDS.assignee]) + barHeight * index / listByAssignee.length;
            })
            .attr('width', 0)
            .attr('height', (d) => {
                let count = cachedData.filter(o => {
                    return o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]
                        && o[DATAFIELDS.plannedStart]
                        && o[DATAFIELDS.plannedEnd]
                }).length;
                if (count > 1) {
                    return (barHeight / count - minBarPadding);
                }
                return barHeight;
            })
            .style('cursor', 'pointer')
            .on('click', (d) => {
                if (d3.event.ctrlKey) {
                    // TODO
                } else {
                    window.open(`${manifest.jiraIssueUrl}${d[DATAFIELDS.issueKey]}`, '_blank');
                }
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .duration(1000)
            .attr('width', (d) => {
                if (d[DATAFIELDS.plannedStart]) {
                    return xScale(new Date(d[DATAFIELDS.plannedEnd])) - xScale(new Date(d[DATAFIELDS.plannedStart]));
                }
            });
    }

    function _drawWarning(svg) {
        // Show warning if planned start or planned end date not set
        let dataWithoutPlannedStartOrEnd = cachedData.filter(d => users[d[DATAFIELDS.assignee]] && (!d[DATAFIELDS.plannedEnd] || !d[DATAFIELDS.plannedStart]));
        svg.append('g')
            .attr('class', 'warning')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .selectAll('.warning')
            .data(dataWithoutPlannedStartOrEnd)
            .enter()
            .append('text')
            .attr('x', d => {
                let dataByAssignee = dataWithoutPlannedStartOrEnd.filter(o => o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]);

                let index = dataByAssignee.findIndex(o => o[DATAFIELDS.issueKey] === d[DATAFIELDS.issueKey]);

                return xScale(lowDate) + index*16;
            })
            .attr('y', d => {
                return yScale(d[DATAFIELDS.assignee]) + (barHeight + barPadding) / 2 + 10;
            })
            .text((d) => {
                if (!d[DATAFIELDS.plannedEnd] || !d[DATAFIELDS.plannedStart]) {
                    return 'U';
                }
            })
            .style('cursor', 'pointer')
            .on('click', (d) => {
                if (d3.event.ctrlKey) {
                    // TODO
                } else {
                    window.open(`${manifest.jiraIssueUrl}${d[DATAFIELDS.issueKey]}`, '_blank');
                }
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }

    function _drawTodayBaseline(svg) {
        // Current date baseline
        svg.append('line')
            .attr('class', 'current-line')
            .attr('y2', height)
            .attr('x2', 0)
            .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')');
    }

    function _drawFixedXaxis() {
        document.getElementById('xaxis-chart').innerHTML = '';

        d3.select('#xaxis-chart')
            .append('svg')
            .attr('height', 40)
            .attr('width', width + margin.left + margin.right)
            .append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(' + margin.left + ',' + 10 + ')')
            .call(xAxis);
    }

    function _init() {
        let svg = _createSvg();
        _initTooltip(svg);
        _drawAxisZebra(svg);
        _drawXYAxis(svg);
        _drawFixedXaxis();
        _drawUserDataBar(svg);
        _drawWarning(svg);
        _drawTodayBaseline(svg);    
    }

    _init();
}
