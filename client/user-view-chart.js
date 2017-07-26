function drawUserViewChart(cachedData) {
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

    document.getElementById('figure').innerHTML = '';

    const margin = { top: 50, right: 50, bottom: 50, left: 120 };
    let barHeight = 24;
    const barPadding = 5;
    const axisFontHeight = 17;
    const minBarHeight = 4;
    const minBarPadding = 2;
    let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
    let height = ChartHeight().get();


    if (width <= 0) {
        width = 800;
    }

    if (height <= 0) {
        height = 500;
    }

    let assigneeList = [];
    for (const e in users) {
        assigneeList.push(e);
    }
    
    const maxCount = maxCountOfTasksByPerson();

    barHeight = height / assigneeList.length - barPadding;

    if (barHeight/maxCount < (minBarHeight + minBarPadding)) {
        barHeight = (minBarHeight + minBarPadding) * maxCount;
        height = (barHeight + barPadding)*assigneeList.length;
    }

    let dataWithDate = cachedData.filter(d => d[DATAFIELDS.plannedEnd] || d[DATAFIELDS.plannedStart]);
    const lowDate = new Date(minDate(dataWithDate));
    const topDate = new Date(maxDate(dataWithDate));

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
        .domain(assigneeList)
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
        .ticks(d3.time.weeks, 2)
        .tickSize(-height)
        .outerTickSize(0)
        .tickFormat(d3.time.format('%d %b'));

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .tickSize(-width)
        .orient('left')
        .tickFormat(d => users[d] ? users[d] : d)

    svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(yAxis)

    let color = d3.scale.category20();

    // Assignee Part
    svg.selectAll('.rect')
        .data(cachedData.filter(d => d[DATAFIELDS.plannedEnd] && d[DATAFIELDS.plannedStart] && users[d[DATAFIELDS.assignee]]))
        .enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('fill', (d, i) => {
            let index = cachedData.findIndex(o => o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]);
            return color(index);
        })
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
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
        })

    svg.selectAll('.warning')
        .data(cachedData.filter(d => users[d[DATAFIELDS.assignee]] && (!d[DATAFIELDS.plannedEnd] || !d[DATAFIELDS.plannedStart])))
        .enter()
        .append('text')
        .attr('class', 'warning')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('x', xScale(lowDate))
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
        .on('mouseout', tip.hide)

    svg.append('line')
        .attr('class', 'current-line')
        .attr('y2', height)
        .attr('x2', 0)
        .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')')
}