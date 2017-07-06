var manifest = {
    host: 'http://localhost:8080',
    jiraUrl: 'https://issues.citrite.net/sr/jira.issueviews:searchrequest-csv-all-fields/temp/SearchRequest.csv?jqlQuery=project%20in%20(CC,ATH)%20AND%20(issuetype%20=%20Story%20AND%20labels%20=%20ReadyForImplementation%20OR%20issuetype%20in%20(Bug,%20Task))%20AND%20status%20in%20(planned,%20%22In%20progress%22,%20%22Pending%20pull%20request%22)%20AND%20labels%20=%20CWC_NJ_Team%20AND%20%22Planned%20Start%22%20is%20not%20empty%20and%20%22planned%20end%22%20is%20not%20empty%20ORDER%20BY%20status%20DESC,%20summary%20ASC,%20fixVersion%20ASC,%20rank%20ASC'
    
    // Test large records
    // jiraUrl: 'https://issues.citrite.net/sr/jira.issueviews:searchrequest-csv-all-fields/temp/SearchRequest.csv?jqlQuery=project%20in%20(CC,%20ATH)%20AND%20(issuetype%20=%20Story%20AND%20labels%20=%20ReadyForImplementation%20OR%20issuetype%20in%20(Bug,%20Task))%20AND%20labels%20=%20CWC_NJ_Team%20AND%20%22Planned%20Start%22%20is%20not%20EMPTY%20AND%20%22planned%20end%22%20is%20not%20EMPTY%20ORDER%20BY%20status%20DESC,%20summary%20ASC,%20fixVersion%20ASC,%20rank%20ASC'

    // jiraUrl: 'https://issues.citrite.net/sr/jira.issueviews:searchrequest-csv-all-fields/temp/SearchRequest.csv?jqlQuery=project%20=%20CC%20AND%20issuetype%20in%20(Bug,%20Story)%20AND%20status%20=%20%22In%20Progress%22'

    // jiraUrl: 'https://issues.citrite.net/sr/jira.issueviews:searchrequest-csv-all-fields/temp/SearchRequest.csv?jqlQuery=project in (CC, ATH) AND (issuetype = Story OR issuetype in (Bug, Task)) AND status in (planned, "In progress", "Pending pull request") AND "Planned Start" is not EMPTY AND "planned end" is not EMPTY ORDER BY status DESC, summary ASC, fixVersion ASC, rank ASC'
};
