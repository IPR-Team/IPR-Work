//info:
//Contributors: https://docs.gitlab.com/ce/api/members.html / /projects/:id/members
//Projects: https://docs.gitlab.com/ce/api/search.html

function GitLabAPIConnector(){
  //public function of object GitHubAPIConnector / each kind of connector do need this function!!!
  this.searchForProjects = function(search_string, amount_of_results, page, createdBeforeDate, callback){
    // It seems like the date cant be included in the search API
    var url = "https://gitlab.com/api/v4/search";
    var query = "&search=".concat(search_string);
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
    })
    .catch(function(error){
      console.log(error);
    });
  }

  this.getProjectDetails = function (project_name, owner_name, callback) {
    var project = {};
    for(var i = 0; i < pullProjectResponse.length; i++){
      project = pullProjectResponse[i];
      if(project.general.name === project_name && project.owner.name === owner_name){
        completeProjectData(project, callback);
        break;
      }
    }
  }

  //use this function to get complete data set of a project
  var completeProjectData = function(project, callback){
    var url = "https://gitlab.com/api/v4"
    var accessToken = "?private_token=zsPXGhyv5Rn4ss9W7f2u";
    var query = "/projects/".concat(project.owner.name, "%2F", project.general.name, "/members");
    url = url.concat(query, accessToken);
    fetch(url)
    .then(function(response){
      if(response.ok){
        console.log("Requested: " + url);
        var data_bunch = {}
        data_bunch.project = project;
        data_bunch.object = response.json();
        return data_bunch;
      }else{
        throw new Error("Request could not be executed! The request limit may have been reached.");
      }
    })
    .then(function(data_bunch){
      var object = data_bunch.object;
      var project = data_bunch.project;
      project.amount_contributors = object.length;

      var owner;
      for(var i = 0; i < object.length; i++){
        var contributor = object[i];
        if(contributor.acces_level === 40 || contributor.access_level === 50){
          project.owner.name = contributor.username;
          project.owner.url = contributor.web_url; // TODO: fraglich
          project.owner.image = contributor.avatar_url;
          break;
        }
      }

      callback(project);
    })
    .catch(function(error){
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
