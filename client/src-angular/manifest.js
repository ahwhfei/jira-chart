var manifest = {
    host: 'http://localhost:8080',
    jiraIssueUrl: 'https://issues.citrite.net/browse/',
    jiraUrl: 'https://issues.citrite.net/sr/jira.issueviews:searchrequest-csv-all-fields/temp/SearchRequest.csv?jqlQuery=project%20in%20(CC,%20ATH)%20AND%20(issuetype%20=%20Story%20AND%20labels%20=%20ReadyForImplementation%20OR%20issuetype%20in%20(Bug,%20Task))%20AND%20status%20in%20(planned,%20%22In%20progress%22,%20%22Pending%20pull%20request%22)%20AND%20labels%20=%20CWC_NJ_Team%20ORDER%20BY%20status%20DESC,%20summary%20ASC,%20fixVersion%20ASC,%20rank%20ASC'
};