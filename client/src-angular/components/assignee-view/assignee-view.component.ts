import { Component, Inject, OnInit } from '@angular/core';

import { FetchDataService } from '../../services/fetch-data/fetch-data.service';
import { DateTool } from '../../utilites/date-tool';
import { DATAFIELDS } from '../../models/data-field';
import { users } from '../../models/users';
import { MultipleBarChart } from '../../utilites/multiple-bar-chart';

@Component({
    selector: 'assignee-view',
    template: require('./assignee-view.component.html')
})
export class AssigneeViewComponent implements OnInit {
    private multipleBarChart = new MultipleBarChart();

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
        
        this.multipleBarChart.draw(data);
    }
}