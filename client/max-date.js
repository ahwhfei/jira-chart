function maxDate(cachedData) {
    let maxOfPlannedStart;
    let maxOfPlannedEnd;

    //Planned Start
    cachedData.forEach((o, i) => {
        if (maxOfPlannedStart === undefined) {
            maxOfPlannedStart = i;
        }

        if (o['Custom field (Planned Start)']
            && new Date(o['Custom field (Planned Start)']) > new Date(cachedData[maxOfPlannedStart]['Custom field (Planned Start)'])) {
            maxOfPlannedStart = i;
        }
    });

    //Planned End
    cachedData.forEach((o, i) => {
        if (maxOfPlannedEnd === undefined) {
            maxOfPlannedEnd = i;
        }

        if (o['Custom field (Planned End)']
            && new Date(o['Custom field (Planned End)']) > new Date(cachedData[maxOfPlannedEnd]['Custom field (Planned End)'])) {
            maxOfPlannedEnd = i;
        }
    });

    if (maxOfPlannedStart === undefined) {
        return cachedData[maxOfPlannedEnd] && cachedData[maxOfPlannedEnd]['Custom field (Planned End)'];
    } else if (maxOfPlannedEnd === undefined) {
        return cachedData[maxOfPlannedStart] && cachedData[maxOfPlannedStart]['Custom field (Planned Start)'];
    } else if (new Date(cachedData[maxOfPlannedStart]['Custom field (Planned Start)']) > new Date(cachedData[maxOfPlannedEnd]['Custom field (Planned End)'])) {
        return cachedData[maxOfPlannedStart]['Custom field (Planned Start)'];
    } else {
        return cachedData[maxOfPlannedEnd]['Custom field (Planned End)'];
    }
}