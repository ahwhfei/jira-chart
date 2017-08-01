import { DATAFIELDS } from '../models/data-field';

export class DateTool {
    public static minDate(cachedData: Object[]): string {
        let minOfPlannedStart;
        let minOfPlannedEnd;

        //Planned Start
        cachedData.forEach((o, i) => {
            if (minOfPlannedStart === undefined) {
                minOfPlannedStart = i;
            }

            if (o[DATAFIELDS.plannedStart]
                && new Date(o[DATAFIELDS.plannedStart]) < new Date(cachedData[minOfPlannedStart][DATAFIELDS.plannedStart])) {
                minOfPlannedStart = i;
            }
        });

        //Planned End
        cachedData.forEach((o, i) => {
            if (minOfPlannedEnd === undefined) {
                minOfPlannedEnd = i;
            }

            if (o[DATAFIELDS.plannedEnd]
                && new Date(o[DATAFIELDS.plannedEnd]) < new Date(cachedData[minOfPlannedEnd][DATAFIELDS.plannedEnd])) {
                minOfPlannedEnd = i;
            }
        });

        if (minOfPlannedStart === undefined) {
            return cachedData[minOfPlannedEnd] && cachedData[minOfPlannedEnd][DATAFIELDS.plannedEnd];
        } else if (minOfPlannedEnd === undefined) {
            return cachedData[minOfPlannedStart] && cachedData[minOfPlannedStart][DATAFIELDS.plannedStart];
        } else if (new Date(cachedData[minOfPlannedStart][DATAFIELDS.plannedStart]) < new Date(cachedData[minOfPlannedEnd][DATAFIELDS.plannedEnd])) {
            return cachedData[minOfPlannedStart][DATAFIELDS.plannedStart];
        } else {
            return cachedData[minOfPlannedEnd][DATAFIELDS.plannedEnd];
        }
    }

    public static maxDate(cachedData: Object[]): string {
        let maxOfPlannedStart;
        let maxOfPlannedEnd;

        //Planned Start
        cachedData.forEach((o, i) => {
            if (maxOfPlannedStart === undefined) {
                maxOfPlannedStart = i;
            }

            if (o[DATAFIELDS.plannedStart]
                && new Date(o[DATAFIELDS.plannedStart]) > new Date(cachedData[maxOfPlannedStart][DATAFIELDS.plannedStart])) {
                maxOfPlannedStart = i;
            }
        });

        //Planned End
        cachedData.forEach((o, i) => {
            if (maxOfPlannedEnd === undefined) {
                maxOfPlannedEnd = i;
            }

            if (o[DATAFIELDS.plannedEnd]
                && new Date(o[DATAFIELDS.plannedEnd]) > new Date(cachedData[maxOfPlannedEnd][DATAFIELDS.plannedEnd])) {
                maxOfPlannedEnd = i;
            }
        });

        if (maxOfPlannedStart === undefined) {
            return cachedData[maxOfPlannedEnd] && cachedData[maxOfPlannedEnd][DATAFIELDS.plannedEnd];
        } else if (maxOfPlannedEnd === undefined) {
            return cachedData[maxOfPlannedStart] && cachedData[maxOfPlannedStart][DATAFIELDS.plannedStart];
        } else if (new Date(cachedData[maxOfPlannedStart][DATAFIELDS.plannedStart]) > new Date(cachedData[maxOfPlannedEnd][DATAFIELDS.plannedEnd])) {
            return cachedData[maxOfPlannedStart][DATAFIELDS.plannedStart];
        } else {
            return cachedData[maxOfPlannedEnd][DATAFIELDS.plannedEnd];
        }
    }
}