/**
  This manager will create a matching connector object and turns it back.
  Those connectors handle each a special API.
  @author H.Tanke
  @Version 1.0
  @param gitHubToken access token for GitHub for more allowed request per hour.
  @param gitLabToken access token for GitLab for more allowed request per hour.
*/
function ConnectorManager(gitHubToken, gitLabToken){
  var ghToken = gitHubToken;
  var glToken = gitLabToken;
  this.getConnector = function(source){
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
