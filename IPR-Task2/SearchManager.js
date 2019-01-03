function searchForProjects(searchString, source, callback){
  if(source != null){
      if(source === "BitBucket"){
        pullBitBucketRepositories(searchString, callback);
      }else if(source === "GitHub"){
        pullGitHubRepositories(searchString, callback);
      }else if(source === "GitLab"){
        pullGitLabRepositories(searchString, callback);
      }
  }
  return 0;
}
