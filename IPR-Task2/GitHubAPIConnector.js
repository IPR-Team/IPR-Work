function pullGitHubRepositories(searchString, callBack){
  console.log("Pulling GitHub repositorys now");
  url = "https://api.github.com/search/repositories";
  query = "?q=".concat(searchString);
  sort = "&sort=updated"
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
    var object = jsonString.items;

    for(i = 0; i < object.length; i++){ //jsonObject.length || JSON.parse(jsonString).total_count
      console.log(object[i]);
      pullProjectResponse.push(parseObjectToProjectData(object[i]));
    }
    callBack(pullProjectResponse);
  }).
  catch(function(error){
    console.log(error);
  });
}

function parseJSONToProjects(jsonString){
  var jsonObject = JSON.parse(jsonString).items;

  for(i = 0; i < jsonObject.length; i++){ //jsonObject.length || JSON.parse(jsonString).total_count
    addProjectToTable(parseObjectToProjectData(jsonObject[i]));
  }
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
