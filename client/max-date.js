function maxDate(cachedData, days) {

    function _maxDate() {
        let maxOfPlannedStart;
        let maxOfPlannedEnd;

        //Planned Start
        cachedData.forEach((o, i) => {
            if (maxOfPlannedStart === undefined || !cachedData[maxOfPlannedStart][DATAFIELDS.plannedStart]) {
                maxOfPlannedStart = i;
            }

            if (o[DATAFIELDS.plannedStart]
                && new Date(o[DATAFIELDS.plannedStart]) > new Date(cachedData[maxOfPlannedStart][DATAFIELDS.plannedStart])) {
                maxOfPlannedStart = i;
            }
        });

        //Planned End
        cachedData.forEach((o, i) => {
            if (maxOfPlannedEnd === undefined || !cachedData[maxOfPlannedEnd][DATAFIELDS.plannedEnd]) {
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

    const maxDateValue = new Date(_maxDate());

    if (days && maxDateValue != 'Invalid Date') {
        let limitDate = new Date();
        limitDate.setDate(limitDate.getDate() + days);

        if (maxDateValue > limitDate) {
            return limitDate;
        }
    }

    return maxDateValue;
}
