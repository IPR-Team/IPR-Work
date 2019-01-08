function pullFirstGitHubRepositorys(searchString, amount_of_results, callBack){
  url = "https://api.github.com/search/repositories";
  query = "?q=".concat(searchString);
  sort = "&sort=updated";
  url = url.concat(query,sort);
  pullProjectResponse = [];
  fetch(url)
  .then(function(response){
    //console.log(response.readyState);
    if(response.ok){
      console.log("Requested: " + url);
      return response.json();
    }else{
      throw new Error("Search results konnte nicht geladen werden!");
    }
  })
  .then(function(jsonString){
    var object = jsonString.items;
    console.log("Received " + object.length + " items");
    for(i = 0; i < object.length; i++){ //jsonObject.length || JSON.parse(jsonString).total_count
      pullProjectResponse.push(parseObjectToProjectData(object[i]));
    }
    callBack(pullProjectResponse);
  }).
  catch(function(error){
    console.log(error);
  });
}

function processDescription(description){
  if(description != null){
    description = description.replace(/[\s\r\n\t]+/g, " ");
  }
  return description;
}

function parseObjectToProjectData(object){
  //Name Projekt/Repository + Url
  //Description
  //Quelle (GitHub, GitLab or BitBucket)
  //Datum letzte Aktualisierung
  //Owner + Profpic + Url
  //Anzahl beteiligte Personen/Orgnaisationen (Contributors)
  //Projektseite/Homepage außerhalb repo
  var project = {};
  project.general = {};
  project.general.name = object.name;
  project.general.url = object.html_url;
  project.description = processDescription(object.description);
  project.source = "GitHub";
  project.last_updated = object.updated_at;
  project.owner = {};
  project.owner.name = object.owner.login;
  project.owner.url = object.owner.html_url;
  project.owner.image = object.owner.avatar_url;
  project.amount_contributors = 0;
  project.external_homepage = "http://";
  return project;
}
