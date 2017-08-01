import { Injectable, Inject } from '@angular/core';

@Injectable()
export class FetchDataService {
    private jiraRawData: Object[];
    private d3;
    private manifest;
    private fetchingPromise: Promise<Object[]>;

    constructor(@Inject('window') private window: Window) {
        console.log(1111);
        this.d3 = (this.window as any).d3;
        this.manifest = (this.window as any).manifest;
    }

    public get jiraData(): Object[] {
        if (this.jiraRawData && this.jiraRawData.length) {
            return this.jiraRawData;
        }

        return [];
    }

    public async jiraDataAsync(): Promise<Object[]> {
        if (this.fetchingPromise) {
            return this.fetchingPromise;
        }

        let data = await this.fetchJiraCacheData();

        if (!data || !data.length) {
            data = await this.fetchJiraData();
        }

        console.table(data);

        return data;
    }

    private fetchJiraData(): Promise<Object[]> {
        return this.fetchingPromise = new Promise((resolve, reject) => {
            this.d3.csv(`${this.manifest.host}/jira?url=${this.manifest.jiraUrl}`, (error, data) => {
                this.jiraRawData = data;
                resolve(this.jiraRawData);
            });
        });
    }

    private fetchJiraCacheData(): Promise<Object[]> {
        return this.fetchingPromise = new Promise((resolve, reject) => {
            this.d3.json(`${this.manifest.host}/jiracached`, (error, data) => {
                if (!error && data && data.length) {
                    this.jiraRawData = data;
                    resolve(this.jiraRawData);
                } else {
                    resolve([]);
                }
            });
        });
    }
}
