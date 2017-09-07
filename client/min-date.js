function minDate(cachedData, days) {

    function _minDate() {
        let minOfPlannedStart;
        let minOfPlannedEnd;

        //Planned Start
        cachedData.forEach((o, i) => {
            if (minOfPlannedStart === undefined || !cachedData[minOfPlannedStart][DATAFIELDS.plannedStart]) {
                minOfPlannedStart = i;
            }

            if (o[DATAFIELDS.plannedStart]
                && new Date(o[DATAFIELDS.plannedStart]) < new Date(cachedData[minOfPlannedStart][DATAFIELDS.plannedStart])) {
                minOfPlannedStart = i;
            }
        });

        //Planned End
        cachedData.forEach((o, i) => {
            if (minOfPlannedEnd === undefined || !cachedData[minOfPlannedEnd][DATAFIELDS.plannedEnd]) {
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

    const minDateValue = new Date(_minDate());

    if (days && minDateValue != 'Invalid Date') {
        let limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - days);

        if (minDateValue < limitDate) {
            return limitDate;
        }
    }

    return minDateValue;
}