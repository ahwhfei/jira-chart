let tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html((d) => {
        let plannedStart = d[DATAFIELDS.plannedStart] ? d3.time.format('%d %b')(new Date(d[DATAFIELDS.plannedStart])) : 'TBD';
        let plannedEnd = d[DATAFIELDS.plannedEnd] ? d3.time.format('%d %b')(new Date(d[DATAFIELDS.plannedEnd])) : 'TBD';
        return `<strong>${users[d[DATAFIELDS.assignee]] 
                            && users[d[DATAFIELDS.assignee]].name 
                            ? users[d[DATAFIELDS.assignee]].name 
                            : d[DATAFIELDS.assignee]}</strong>
                <span>(${plannedStart} - ${plannedEnd})</span>
                <span>${d[DATAFIELDS.status]}</span>
                <br/>
                <span>${d[DATAFIELDS.issueKey]} ${d[DATAFIELDS.summary]}</span>`;
    });