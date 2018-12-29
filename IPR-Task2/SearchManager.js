function searchForProjects(searchString, sources){
  var srcLength = sources.length;
  if(srcLength > 0){
    for(i = 0; i < srcLength; i++){
      if(sources[i] === "BitBucket"){
        pullBitBucketRepositories(searchString);
      }else if(sources[i] === "GitHub"){
        pullGitHubRepositories(searchString);
      }else if(sources[i] === "GitLab"){
        pullGitLabRepositories(searchString);
      }
    }
  }
}
