//info:
//Contributors: https://docs.gitlab.com/ce/api/repositories.html / /projects/:id/members
//Projects: https://docs.gitlab.com/ce/api/search.html

function GitLabAPIConnector(aSearchString, aCallback){
  var callback = aCallback;
  var searchString = aSearchString;

  //public function of object GitHubAPIConnector / each kind of connector do need this function!!!
  this.searchForRepositorys = function(amount_of_results, page){
    //Header: link - ...    auswerten für maximale Anzahl der Seiten
    var url = "https://gitlab.com/api/v4/search";
    var query = "&search=".concat(searchString);
    var scope = "?scope=projects"
    var accessToken = "&private_token=zsPXGhyv5Rn4ss9W7f2u"; //-> CONFIG!
    var maxResults = "&per_page=" + amount_of_results;
    var page = "&page=" + page;
    var url = url.concat(scope, query, accessToken, maxResults, page);
    var pullProjectResponse = [];
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
      var object = jsonString;
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
    project.general.url = object.http_url_to_repo;
    project.description = processDescription(object.description);
    project.source = "GitLab";
    project.last_updated = object.last_activity_at;
    project.owner = {};
    project.owner.name = "test"//object.owner.login;
    project.owner.url = "test"//object.owner.html_url;
    project.owner.image = "test"//object.owner.avatar_url;
    project.amount_contributors = 0;
    project.external_homepage = object.web_url;
    return project;
  }
};
