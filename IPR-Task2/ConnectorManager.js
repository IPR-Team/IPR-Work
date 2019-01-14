function getConnector(source){
  if(source != null){
      var connector;
      console.log("Target: " + source);
      if(source === "GitHub"){
        connector = new GitHubAPIConnector();
      }else if(source === "GitLab"){
        connector = new GitLabAPIConnector();
      }
  }
  return connector;
}
