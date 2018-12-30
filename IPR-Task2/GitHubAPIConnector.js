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
