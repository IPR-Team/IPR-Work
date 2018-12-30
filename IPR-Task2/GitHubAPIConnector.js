const Http = new XMLHttpRequest();

function pullGitHubRepositories(searchString){
  url = "https://api.github.com/search/repositories";
  query = "?q=".concat(searchString);
  sort = "&sort=updated"
  url = url.concat(query,sort);
  var projects = [];
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange=(e)=>{
    if(Http.readyState === 4 && Http.status === 200 ){
        projects.push(parseJSONToProjects(Http.responseText));
    }
  }
}

function parseJSONToProjects(jsonString){
  var jsonObject = JSON.parse(jsonString).items;

  for(i = 0; i < jsonObject.length; i++){ //jsonObject.length || JSON.parse(jsonString).total_count
    addProjectToTable(parseObjectToProjectData(jsonObject[i]));
  }
}

function processDescription(description){
  if(description != null){
    alert(description);
    description = description.replace(/[\s\r\n\t]+/g, " ");
    alert(description);
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
  project.name = object.name;
  project.description = processDescription(object.description);
  project.source = "GitHub";
  project.last_updated = object.updated_at;
  project.owner = object.owner.login;
  project.amount_contributors = 0;
  project.external_homepage = "http://";
  //object.owner.avatar_url -> Profpic
  //object.owner.html_url -> Link to profil
  //object.html_url -> Link to repository
  return project;
}
