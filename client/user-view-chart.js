function drawUserViewChart(cachedData) {
    document.getElementById('figure').innerHTML = '';

    const margin = { top: 50, right: 50, bottom: 50, left: 120 };
    let barHeight = 18;
    const barPadding = 6;
    const axisFontHeight = 17;
    let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
    let height = ChartHeight().get();

    if (width <= 0) {
        width = 800;
    }

    if (height <= 0) {
        height = 500;
    }

    let assigneeList = [... new Set(cachedData.map((o) => o['Assignee']))];

    barHeight = height/assigneeList.length - barPadding;

    const lowDate = new Date(minDate(cachedData));
    const topDate = new Date(maxDate(cachedData));

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


    svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(yAxis)

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
        })
        .attr('y', (d) => {
            return yScale(d['Assignee'])
        })
        .attr('width', 0)
        .attr('height', barHeight)
        .style("cursor", "pointer")
        .on('click', (d) => {
            if (d3.event.ctrlKey) {
                // TODO
            } else {
                window.open('https://issues.citrite.net/browse/' + d['Issue key'], '_blank');
            }
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .duration(1000)
        .attr('width', (d) => {
            if (d['Custom field (Planned Start)']) {
                return xScale(new Date(d['Custom field (Planned End)'])) - xScale(new Date(d['Custom field (Planned Start)']));
            }
        })

    svg.selectAll('.warning')
        .data(cachedData.filter(d => !d['Custom field (Planned End)'] || !d['Custom field (Planned Start)']))
        .enter()
        .append('text')
        .attr('class', 'warning')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('x', xScale(lowDate))
        .attr('y', d => {
            return yScale(d['Assignee']) + (barHeight+barPadding)/2 + 10;
        })
        .text((d) => {
            if (!d['Custom field (Planned End)'] || !d['Custom field (Planned Start)']) {
                return  'U';
            }
        })
        .style("cursor", "pointer")
        .on('click', (d) => {
            if (d3.event.ctrlKey) {
                // TODO
            } else {
                window.open('https://issues.citrite.net/browse/' + d['Issue key'], '_blank');
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