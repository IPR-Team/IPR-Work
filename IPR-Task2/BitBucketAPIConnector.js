//Useful link: Bitbucket API: https://developer.atlassian.com/bitbucket/api/2/reference/
//Noch ein paar Tipps:
//- Zuerst solltest du checken, ob es ein Limit für API Requests gibt. Meistens
// gibt es dann eine Ausweichadresse, wo du deinen Connector testen kannst, ohne
// dein Limit auf zu brauchen
//- Guck am Besten auch ob es schon von der API her einen Such-/Filteraögorithmus gibt

function pullBitBucketRepositories(searchString){
  console.log("Pulling BitBucket repositorys now");
  url = ""; //url for pulling results
  query = ""; //is there any search query addable to url?
  sort = ""; //is there any sort query addable to url?
  url = url.concat(query,sort);
  pullProjectResponse = [];
  console.log("Created url: " + url);
  fetch(url)
  .then(function(response){
    //console.log(response.readyState);
    if(response.ok){
      console.log(response);
      return response.json();
    }else{
      throw new Error("Search results konnte nicht geladen werden!");
    }
  })
  .then(function(jsonString){
    console.log(jsonString);
    callBack(param); // insert project list here / look at GitHubAPIConnector
  }).
  catch(function(error){
    console.log(error);
  });
}
