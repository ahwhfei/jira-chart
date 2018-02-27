

let chartHeight = 0;
function ChartHeight() {

    return {
        set: (height) => chartHeight = height,
        get: () => chartHeight
    }
}

function getElementIfNotExistCreateNewOne(elementId, containerId) {
    let element = document.getElementById(elementId);
    if (!element) {
        const container = document.getElementById(containerId);
        element = document.createElement('div');
        element.setAttribute('id', elementId);
        container.appendChild(element);
    }

    return element;
}

function clearElement(elementId, containerId) {
    let element = getElementIfNotExistCreateNewOne(elementId, containerId);
    element.innerHTML = '';

    let settingsElement = document.getElementById('setting-container');
    settingsElement && settingsElement.parentNode.removeChild(settingsElement);
}

function drawTaskViewChart(data) {
    clearElement('figure', 'container');
    
    cachedData = data.filter((d) => {
        return users[d[DATAFIELDS.assignee]]
            && d[DATAFIELDS.plannedEnd]
            && d[DATAFIELDS.plannedStart]
            && d[DATAFIELDS.plannedEnd] !== d[DATAFIELDS.plannedStart]
            && d[DATAFIELDS.issueType] !== 'Sub-task';
        }).sort((a, b) => {
            if (a[DATAFIELDS.priority] > b[DATAFIELDS.priority]) return 1;
            if (a[DATAFIELDS.priority] < b[DATAFIELDS.priority]) return -1;
            if (a[DATAFIELDS.priority] === b[DATAFIELDS.priority]) return 0;            
        });

    const margin = { top: 0, right: 50, bottom: -2, left: 120 };
    let barHeight = 18;
    const barPadding = 6;
    const axisFontHeight = 17;
    const figure = getElementIfNotExistCreateNewOne('figure', 'container');
    let width = figure.clientWidth - margin.left - margin.right;
    let height = cachedData.length * (barHeight + barPadding);

    if (width < 200) {
        width = 200;
    }

    if (height <= 0) {
        height = 500;
    }

    if ((height > (window.innerHeight - 80 - margin.top - margin.bottom)) && height < 1400) {
        let _height = window.innerHeight - 80 - margin.top - margin.bottom - 10;
        let _barHeight = _height / (cachedData.length + 1) - barPadding;

        if (_barHeight + barPadding >= axisFontHeight) {
            height = _height;
            barHeight = _barHeight;
        }
    }

    ChartHeight().set(height);

    const lowDate = minDate(cachedData, manifest.bottomDays);
    const topDate = maxDate(cachedData, manifest.topDays);

    if (lowDate == 'Invalid Date' || topDate == 'Invalid Date') {
        throw 'Invalid Data';
    }

    const [lowDateWithMargin, topDateWithMargin] = [
        new Date(lowDate).setDate(lowDate.getDate() - 2),
        new Date(topDate).setDate(topDate.getDate() + 2),
    ];

    let xScale = d3.time.scale()
        .domain([lowDateWithMargin, topDateWithMargin])
        .range([20, width]);

    let yScale = d3.scale.ordinal()
        .domain(cachedData.map((element) => element[DATAFIELDS.issueKey]))
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

    function _drawFixedXaxis() {
        clearElement('xaxis-chart', 'container');

        d3.select('#xaxis-chart')
            .append('svg')
            .attr('height', 40)
            .attr('width', width + margin.left + margin.right)
            .append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(' + margin.left + ',' + 10 + ')')
            .call(xAxis);
    }

    _drawFixedXaxis();

    function customerYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
    }

    svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(customerYAxis)

    svg.select('.yaxis')
        .selectAll('text')
        .style('cursor', 'pointer')
        .attr('class', (d, i) => {
            return `yaxis-text-${cachedData[i][DATAFIELDS.priority].toLowerCase()}`;
        })
        .on('click', (d) => {
            window.open(`${manifest.jiraIssueUrl}${d}`, '_blank');
        })

    let colorType = {
        story: '#63BA3C',
        task: '#4BADE8',
        bug: '#d62728',
        epic: '#904ee2',
        'sub-task': '#9467bd'
    }

    let color = (c) => colorType[c];

    svg.selectAll('.rect')
        .data(cachedData.filter(d => 
            new Date(d[DATAFIELDS.plannedStart]) < topDate
            && new Date(d[DATAFIELDS.plannedEnd] ) > lowDate))
        .enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('fill', (d, i) => { return color(d[DATAFIELDS.issueType].toLowerCase()); })
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('x', (d) => {
            if (d[DATAFIELDS.plannedStart]) {
                const plannedStart = new Date(d[DATAFIELDS.plannedStart]);
                
                if (plannedStart < lowDate) {
                    return xScale(lowDate);
                }

                return xScale(plannedStart);
            }
        })
        .attr('y', (d) => {
            return yScale(d[DATAFIELDS.issueKey]) + axisFontHeight / 2 - barHeight / 2;
        })
        .attr('width', 0)
        .attr('height', barHeight)
        .on('click', (d) => {
            // TODO
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .duration(1000)
        .attr('width', (d) => {
            if (d[DATAFIELDS.plannedEnd] && d[DATAFIELDS.plannedStart]) {
                const plannedEnd = new Date(d[DATAFIELDS.plannedEnd]);
                const plannedStart = new Date(d[DATAFIELDS.plannedStart]);

                if (plannedEnd > topDate) {
                    return xScale(topDate) - (plannedStart > lowDate ? xScale(plannedStart) : xScale(lowDate));             
                }

                return xScale(plannedEnd) - (plannedStart > lowDate ? xScale(plannedStart) : xScale(lowDate));
            }
        })

    svg.append('line')
        .attr('class', 'current-line')
        .attr('y2', height)
        .attr('x2', 0)
        .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')')

}
