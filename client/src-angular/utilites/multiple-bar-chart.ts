import { DateTool } from '../utilites/date-tool';
import { DATAFIELDS } from '../models/data-field';
import { users } from '../models/users';

export class MultipleBarChart {
    private readonly margin = { top: 50, right: 50, bottom: 50, left: 150 };
    private readonly barPadding = 5;
    private readonly axisFontHeight = 17;
    private readonly minBarHeight = 4;
    private readonly minBarPadding = 2;

    private readonly d3 = (window as any).d3;
    private readonly manifest = (window as any).manifest;

    private cachedData;
    private assigneeList = [];
    private width;
    private height;
    private barHeight;
    private lowDate;
    private topDate
    private xScale;
    private yScale;
    private xAxis;
    private yAxis;
    private tip = this.tooltip;

    public draw(data): void {
        this.cachedData = data;

        [this.width, this.height, this.barHeight] = this._determineWidthHeight();
        [this.lowDate, this.topDate] = this._determineXAxisLimit();
        [this.xScale, this.yScale] = this._createXYScale();
        [this.xAxis, this.yAxis] = this._createXYAxis();

        let svg = this._createSvg();
        this._initTooltip(svg);
        this._drawAxisZebra(svg);
        this._drawXYAxis(svg);
        this._drawUserDataBar(svg);
        this._drawWarning(svg);
        this._drawTodayBaseline(svg);    
    }

    private _determineXAxisLimit() {
        let dataWithDate = this.cachedData.filter(d => users[d[DATAFIELDS.assignee]] && (d[DATAFIELDS.plannedEnd] || d[DATAFIELDS.plannedStart]));
        let lowDate = new Date(DateTool.minDate(dataWithDate));
        let topDate = new Date(DateTool.maxDate(dataWithDate));

        // if (lowDate == 'Invalid Date' || topDate == 'Invalid Date') {
        //     console.error('Invalid Data');
        //     return;
        // }

        lowDate.setDate(lowDate.getDate() - 10);
        topDate.setDate(topDate.getDate() + 10);
        
        return [lowDate, topDate];
    }

    private _createXYScale() {
        let xScale = this.d3.time.scale()
            .domain([this.lowDate, this.topDate])
            .range([20, this.width]);

        let yScale = this.d3.scale.ordinal()
            .domain(this.assigneeList)
            .rangeRoundBands([0, this.height], '.1');

        return [xScale, yScale];
    }

    private _createSvg() {
        document.getElementById('figure').innerHTML = '';

        return this.d3.select('#figure')
            .append('svg')
            .attr('class', 'svg')
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .attr('width', this.width + this.margin.left + this.margin.right);
    }

    private _determineWidthHeight() {
        let width = document.getElementById('figure').clientWidth - this.margin.left - this.margin.right;
        let height = 0;
        let barHeight = 24;

        if (width < 200) {
            width = 200;
        }

        if (height <= 0) {
            height = 500;
        }

        for (const e in users) {
            this.assigneeList.push(e);
        }

        barHeight = height / this.assigneeList.length - this.barPadding;

        const maxCount = this.maxCountOfTasksByPerson();

        if (barHeight/maxCount < (this.minBarHeight + this.minBarPadding)) {
            barHeight = (this.minBarHeight + this.minBarPadding) * maxCount;
            height = (barHeight + this.barPadding)*this.assigneeList.length;
        }

        return [width, height, barHeight];
    }    

    private maxCountOfTasksByPerson() {
        let max = 0;

        for (const d of this.cachedData) {
            let count = this.cachedData.filter(o => {
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

    private get tooltip() {
        return this.d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html((d) => {
                let plannedStart = d[DATAFIELDS.plannedStart] ? this.d3.time.format('%d %b')(new Date(d[DATAFIELDS.plannedStart])) : 'TBD';
                let plannedEnd = d[DATAFIELDS.plannedEnd] ? this.d3.time.format('%d %b')(new Date(d[DATAFIELDS.plannedEnd])) : 'TBD';
                return `<strong>${users[d[DATAFIELDS.assignee]] ? users[d[DATAFIELDS.assignee]] : d[DATAFIELDS.assignee]}</strong>
                <span>(${plannedStart} - ${plannedEnd})</span>
                <span>${d[DATAFIELDS.status]}</span>
                <br/>
                <span>${d[DATAFIELDS.issueKey]} ${d[DATAFIELDS.summary]}</span>`;
            });
    }

    private _initTooltip(svg) {
        svg.call(this.tip);
    }

    private _createXYAxis() {
        let xAxis = this.d3.svg.axis()
            .scale(this.xScale)
            .orient('bottom')
            .ticks(this.d3.time.weeks, 2)
            .tickSize(-this.height)
            .outerTickSize(0)
            .tickFormat(this.d3.time.format('%d %b'));

        let yAxis = this.d3.svg.axis()
            .scale(this.yScale)
            .orient('left')
            .tickFormat(d => users[d] ? users[d] : d);

        return [xAxis, yAxis];
    }

    private _drawAxisZebra(svg) {
        svg.append('g')
            .attr('class', 'axis-rect-zebra')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .selectAll('.axis-rect')
            .data(this.assigneeList)
            .enter()
            .append('rect')
            .attr('class', 'axis-rect')
            .attr('fill', (d, i) => i % 2 === 0 ? '#EEE' : '#E7E7E7')
            .attr('x', d => this.xScale(this.lowDate)-this.margin.left)
            .attr('y', d => this.yScale(d))
            .attr('width', this.xScale(this.topDate)+this.margin.left)
            .attr('height', this.barHeight+this.barPadding);
    }

    private _drawXYAxis(svg) {
        svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(' + this.margin.left + ',' + (this.height + this.margin.top) + ')')
            .call(this.xAxis);

        svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .call(this.customerYAxis);
    }

    private customerYAxis(g) {
        let offset = (this.barHeight + this.barPadding) / 2;
        g.call(this.yAxis);
        g.select(".domain").remove();
    }

    private _drawUserDataBar(svg) {
        let color = this.d3.scale.category20();

        svg.append('g')
            .attr('class', 'rect')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .selectAll('.rect')
            .data(this.cachedData.filter(d => d[DATAFIELDS.plannedEnd] && d[DATAFIELDS.plannedStart] && users[d[DATAFIELDS.assignee]]))
            .enter()
            .append('rect')
            .attr('fill', (d, i) => {
                let index = this.cachedData.findIndex(o => o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]);
                return color(index);
            })
            .attr('x', (d) => {
                if (d[DATAFIELDS.plannedStart]) {
                    return this.xScale(new Date(d[DATAFIELDS.plannedStart]));
                }
            })
            .attr('y', (d) => {
                let listByAssignee = this.cachedData.filter(o => {
                    return o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]
                        && o[DATAFIELDS.plannedStart]
                        && o[DATAFIELDS.plannedEnd]
                });
                let index = listByAssignee.findIndex(o => o[DATAFIELDS.issueKey] === d[DATAFIELDS.issueKey]);
                return this.yScale(d[DATAFIELDS.assignee]) + this.barHeight * index / listByAssignee.length;
            })
            .attr('width', 0)
            .attr('height', (d) => {
                let count = this.cachedData.filter(o => {
                    return o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]
                        && o[DATAFIELDS.plannedStart]
                        && o[DATAFIELDS.plannedEnd]
                }).length;
                if (count > 1) {
                    return (this.barHeight / count - this.minBarPadding);
                }
                return this.barHeight;
            })
            .style('cursor', 'pointer')
            .on('click', (d) => {
                if (this.d3.event.ctrlKey) {
                    // TODO
                } else {
                    window.open(`${this.manifest.jiraIssueUrl}${d[DATAFIELDS.issueKey]}`, '_blank');
                }
            })
            .on('mouseover', this.tip.show)
            .on('mouseout', this.tip.hide)
            .transition()
            .duration(1000)
            .attr('width', (d) => {
                if (d[DATAFIELDS.plannedStart]) {
                    return this.xScale(new Date(d[DATAFIELDS.plannedEnd])) - this.xScale(new Date(d[DATAFIELDS.plannedStart]));
                }
            });
    }

    private _drawWarning(svg) {
        // Show warning if planned start or planned end date not set
        let dataWithoutPlannedStartOrEnd = this.cachedData.filter(d => users[d[DATAFIELDS.assignee]] && (!d[DATAFIELDS.plannedEnd] || !d[DATAFIELDS.plannedStart]));
        svg.append('g')
            .attr('class', 'warning')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .selectAll('.warning')
            .data(dataWithoutPlannedStartOrEnd)
            .enter()
            .append('text')
            .attr('x', d => {
                let dataByAssignee = dataWithoutPlannedStartOrEnd.filter(o => o[DATAFIELDS.assignee] === d[DATAFIELDS.assignee]);

                let index = dataByAssignee.findIndex(o => o[DATAFIELDS.issueKey] === d[DATAFIELDS.issueKey]);

                return this.xScale(this.lowDate) + index*16;
            })
            .attr('y', d => {
                return this.yScale(d[DATAFIELDS.assignee]) + (this.barHeight + this.barPadding) / 2 + 10;
            })
            .text((d) => {
                if (!d[DATAFIELDS.plannedEnd] || !d[DATAFIELDS.plannedStart]) {
                    return 'U';
                }
            })
            .style('cursor', 'pointer')
            .on('click', (d) => {
                if (this.d3.event.ctrlKey) {
                    // TODO
                } else {
                    window.open(`${this.manifest.jiraIssueUrl}${d[DATAFIELDS.issueKey]}`, '_blank');
                }
            })
            .on('mouseover', this.tip.show)
            .on('mouseout', this.tip.hide);
    }

    private _drawTodayBaseline(svg) {
        // Current date baseline
        svg.append('line')
            .attr('class', 'current-line')
            .attr('y2', this.height)
            .attr('x2', 0)
            .attr('transform', 'translate(' + (this.margin.left + this.xScale(new Date())) + ',' + this.margin.top + ')');
    }
        
}
