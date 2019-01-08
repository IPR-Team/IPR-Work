function getConnector(source, callback){
  if(source != null){
      var connector;
      console.log("Target: " + source);
      if(source === "BitBucket"){
        //pullFirstBitBucketRepositorys(searchString, amount_of_results, callback);
      }else if(source === "GitHub"){
        connector = new GitHubAPIConnector(callback);
      }else if(source === "GitLab"){
        //pullFirstGitLabRepositorys(searchString, amount_of_results, callback);
      }
  }
  return connector;
}
