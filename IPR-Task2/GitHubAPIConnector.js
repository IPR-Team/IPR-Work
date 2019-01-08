//Constructor and Class
function GitHubAPIConnector(aSearchString, aCallback){
  var callback = aCallback;
  var searchString = aSearchString;

  //public function of object GitHubAPIConnector
  this.searchForRepositorys = function(amount_of_results, page){
    //Header: link - ...    auswerten für maximale Anzahl der Seiten
    url = "https://api.github.com/search/repositories";
    query = "?q=".concat(searchString);
    maxResults = "&per_page=" + amount_of_results;
    page = "&page=" + page;
    sort = "&sort=updated";
    url = url.concat(query, maxResults, page,sort);
    pullProjectResponse = [];
    fetch(url)
    .then(function(response){
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
      for(i = 0; i < object.length; i++){
        pullProjectResponse.push(parseObjectToProjectData(object[i]));
      }
      callback(pullProjectResponse);
    }).
    catch(function(error){
      console.log(error);
    });
  }

  //private function: Shortened description by triming full string
  var processDescription = function(description){
    if(description != null){
      description = description.replace(/[\s\r\n\t]+/g, " "); //regex -> check me on regexr.com
    }
    return description;
  }

  var parseObjectToProjectData = function(object){
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
    project.external_homepage = object.homepage;
    return project;
  }
};
