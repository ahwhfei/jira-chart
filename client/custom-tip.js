let tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html((d) => {
        let plannedStart = d['Custom field (Planned Start)'] ? d3.time.format('%d %b')(new Date(d['Custom field (Planned Start)'])) : 'TBD';
        let plannedEnd = d['Custom field (Planned End)'] ? d3.time.format('%d %b')(new Date(d['Custom field (Planned End)'])) : 'TBD';
        return `<strong>${d['Assignee']}</strong>
                <span>(${plannedStart} - ${plannedEnd})</span>
                <span>${d['Status']}</span>
                <br/>
                <span>${d['Issue key']} ${d['Summary']}</span>`;
    });