import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { FetchDataService } from '../../services/fetch-data/fetch-data.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-root',
    template: require('./app.component.html'),
    styles: [require('./app.component.less')]
})
export class AppComponent implements OnInit {
    constructor(private fetchData: FetchDataService) {
    }

    public ngOnInit(): void {
        this.fetchData.jiraDataAsync();
        console.log(2222222);
    }
}