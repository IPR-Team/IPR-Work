function searchForProjects(searchString, source, amount_of_results, callback){
  if(source != null){
      console.log("Target: " + source);
      if(source === "BitBucket"){
        pullBitBucketRepositorys(searchString, amount_of_results, callback);
      }else if(source === "GitHub"){
        pullGitHubRepositorys(searchString, amount_of_results, callback);
      }else if(source === "GitLab"){
        pullGitLabRepositorys(searchString, amount_of_results, callback);
      }
  }
  return 0;
}
