function minDate(cachedData) {
    let minOfPlannedStart;
    let minOfPlannedEnd;

    //Planned Start
    cachedData.forEach((o, i) => {
        if (minOfPlannedStart === undefined) {
            minOfPlannedStart = i;
        }

        if (o['Custom field (Planned Start)']
            && new Date(o['Custom field (Planned Start)']) < new Date(cachedData[minOfPlannedStart]['Custom field (Planned Start)'])) {
            minOfPlannedStart = i;
        }
    });

    //Planned End
    cachedData.forEach((o, i) => {
        if (minOfPlannedEnd === undefined) {
            minOfPlannedEnd = i;
        }

        if (o['Custom field (Planned End)']
            && new Date(o['Custom field (Planned End)']) < new Date(cachedData[minOfPlannedEnd]['Custom field (Planned End)'])) {
            minOfPlannedEnd = i;
        }
    });

    if (minOfPlannedStart === undefined) {
        return cachedData[minOfPlannedEnd] && cachedData[minOfPlannedEnd]['Custom field (Planned End)'];
    } else if (minOfPlannedEnd === undefined) {
        return cachedData[minOfPlannedStart] && cachedData[minOfPlannedStart]['Custom field (Planned Start)'];
    } else if (new Date(cachedData[minOfPlannedStart]['Custom field (Planned Start)']) < new Date(cachedData[minOfPlannedEnd]['Custom field (Planned End)'])) {
        return cachedData[minOfPlannedStart]['Custom field (Planned Start)'];
    } else {
        return cachedData[minOfPlannedEnd]['Custom field (Planned End)'];
    }
}