function ConnectorManager(gitHubToken, gitLabToken){
  var ghToken = gitHubToken;
  var glToken = gitLabToken;
  this.getConnector = function getConnector(source){
    if(source != null){
        var connector;
        console.log("Target: " + source);
        if(source === "GitHub"){
          connector = new GitHubAPIConnector(ghToken);
        }else if(source === "GitLab"){
          connector = new GitLabAPIConnector(glToken);
        }
    }
    return connector;
  }
}
