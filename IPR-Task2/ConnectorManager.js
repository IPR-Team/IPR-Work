function getConnector(searchString, source, callback){
  if(source != null){
      var connector;
      console.log("Target: " + source);
      if(source === "BitBucket"){
        connector = new BitBucketAPIConnector(searchString, callback);
      }else if(source === "GitHub"){
        connector = new GitHubAPIConnector(searchString, callback);
      }else if(source === "GitLab"){
        connector = new GitLabAPIConnector(searchString, callback);
      }
  }
  return connector;
}
