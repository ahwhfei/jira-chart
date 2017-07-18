

let chartHeight = 0;
function ChartHeight() {

    return {
        set: (height) => chartHeight = height,
        get: () => chartHeight
    }
}

function drawTaskViewChart(data) {
    document.getElementById('figure').innerHTML = '';

    cachedData = data.filter((d) => {
        return d['Custom field (Planned End)'] 
            && d['Custom field (Planned Start)']
            && d['Custom field (Planned End)'] !== d['Custom field (Planned Start)'];
        });

    const margin = { top: 50, right: 50, bottom: 50, left: 120 };
    let barHeight = 18;
    const barPadding = 6;
    const axisFontHeight = 17;
    let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
    let height = cachedData.length * (barHeight + barPadding);

    if (width <= 0) {
        width = 800;
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

    svg.select('.yaxis')
        .selectAll('text')
        .style("cursor", "pointer")
        .on('click', (d) => {
            window.open('https://issues.citrite.net/browse/' + d, '_blank');
        })

    let colorType = {
        story: '#63BA3C',
        task: '#4BADE8',
        bug: '#d62728',
        'sub-task': '#9467bd'
    }

    let color = (c) => colorType[c];

    svg.selectAll('.rect')
        .data(cachedData)
        .enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('fill', (d, i) => { return color(d['Issue Type'].toLowerCase()); })
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('x', (d) => {
            if (d['Custom field (Planned Start)']) {
                return xScale(new Date(d['Custom field (Planned Start)']));
            }
        })
        .attr('y', (d) => {
            return yScale(d['Issue key']) + axisFontHeight / 2 - barHeight / 2;
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
            if (d['Custom field (Planned End)'] && d['Custom field (Planned Start)']) {
                return xScale(new Date(d['Custom field (Planned End)'])) - xScale(new Date(d['Custom field (Planned Start)']));
            }
        })

    svg.append('line')
        .attr('class', 'current-line')
        .attr('y2', height)
        .attr('x2', 0)
        .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')')

}
