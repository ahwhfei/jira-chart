import { Component, Inject, OnInit } from '@angular/core';

import { FetchDataService } from '../../services/fetch-data/fetch-data.service';
import { DATAFIELDS } from '../../models/data-field';
import { users } from '../../models/users';
import { DateTool } from '../../utilites/date-tool';

@Component({
    selector: 'task-view',
    template: require('./task-view.component.html')
})
export class TaskViewComponent implements OnInit {
    constructor(
        private fetchData: FetchDataService,
        @Inject('window') private window: Window
    ) { }

    public ngOnInit(): void {
        this.drawChart();
    }

    public drawChart(): void {
        let data: Object[] = this.fetchData.jiraData;

        if (data && data.length) {
            this._drawChart(data);
            return;
        }

        this.fetchData.jiraDataAsync().then(data => this._drawChart(data));
    }

    private _drawChart(data): void {
        const d3 = (this.window as any).d3;
        const manifest = (this.window as any).manifest;

        document.getElementById('figure').innerHTML = '';

        const cachedData = data.filter((d) => {
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

        const margin = { top: 50, right: 50, bottom: 50, left: 120 };
        let barHeight = 18;
        const barPadding = 6;
        const axisFontHeight = 17;
        let width = document.getElementById('figure').clientWidth - margin.left - margin.right;
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

        const lowDate = new Date(DateTool.minDate(cachedData));
        const topDate = new Date(DateTool.maxDate(cachedData));

        // if (lowDate == 'Invalid Date' || topDate == 'Invalid Date') {
        //     console.error('Invalid Data');
        //     return;
        // }

        lowDate.setDate(lowDate.getDate() - 10);
        topDate.setDate(topDate.getDate() + 10);

        let xScale = d3.time.scale()
            .domain([lowDate, topDate])
            .range([20, width]);

        let yScale = d3.scale.ordinal()
            .domain(cachedData.map((element) => element[DATAFIELDS.issueKey]))
            .rangeRoundBands([0, height], '.1');

        let svg = d3.select('#figure')
            .append('svg')
            .attr('class', 'svg')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right);

        let tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html((d) => {
                let plannedStart = d[DATAFIELDS.plannedStart] ? d3.time.format('%d %b')(new Date(d[DATAFIELDS.plannedStart])) : 'TBD';
                let plannedEnd = d[DATAFIELDS.plannedEnd] ? d3.time.format('%d %b')(new Date(d[DATAFIELDS.plannedEnd])) : 'TBD';
                return `<strong>${users[d[DATAFIELDS.assignee]] ? users[d[DATAFIELDS.assignee]] : d[DATAFIELDS.assignee]}</strong>
                <span>(${plannedStart} - ${plannedEnd})</span>
                <span>${d[DATAFIELDS.status]}</span>
                <br/>
                <span>${d[DATAFIELDS.issueKey]} ${d[DATAFIELDS.summary]}</span>`;
            });

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
            'sub-task': '#9467bd'
        }

        let color = (c) => colorType[c];

        svg.selectAll('.rect')
            .data(cachedData)
            .enter()
            .append('rect')
            .attr('class', 'rect')
            .attr('fill', (d, i) => { return color(d[DATAFIELDS.issueType].toLowerCase()); })
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('x', (d) => {
                if (d[DATAFIELDS.plannedStart]) {
                    return xScale(new Date(d[DATAFIELDS.plannedStart]));
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
                    return xScale(new Date(d[DATAFIELDS.plannedEnd])) - xScale(new Date(d[DATAFIELDS.plannedStart]));
                }
            })

        svg.append('line')
            .attr('class', 'current-line')
            .attr('y2', height)
            .attr('x2', 0)
            .attr('transform', 'translate(' + (margin.left + xScale(new Date())) + ',' + margin.top + ')')

    }
}