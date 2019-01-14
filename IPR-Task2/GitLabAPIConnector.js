//info:
//Contributors: https://docs.gitlab.com/ce/api/members.html / /projects/:id/members
//Projects: https://docs.gitlab.com/ce/api/search.html

function GitLabAPIConnector(){
  var encoder = new TextEncoder();
  var statusCode = 200;
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
      statusCode = response.status;
      return response.json();
    })
    .then(function(jsonString){
      if(statusCode < 299 && statusCode > 200){
        var object = jsonString;
        console.log("Received " + object.length + " items");
        for(i = 0; i < object.length; i++){
          pullProjectResponse.push(parseObjectToProjectData(object[i]));
        }
        callback(pullProjectResponse);
      }else{
        throw new Error("Request: " + jsonString.message);
      }
    })
    .catch(function(error){
      console.log(error);
    });
  }

  this.getProjectDetails = function (id, project, callback) {
    var url = "https://gitlab.com/api/v4"
    var accessToken = "?private_token=zsPXGhyv5Rn4ss9W7f2u";
    var specificPath = encoder.EncodeUrl(project.owner.name.concat("/", project.general.name));
    console.log("Specific path: " + specificPath);
    var query = "/projects/".concat(specificPath, "/members");
    url = url.concat(query, accessToken);
    fetch(url)
    .then(function(response){
      console.log("Requested: " + url);
      statusCode = response.status;
      return response.json();
    })
    .then(function(jsonString){
      if(statusCode < 299 && statusCode > 200){
        var object = jsonString;
        console.log(object);
        project.amount_contributors = object.length;
        var owner = {};
        console.log("Received items: " + object.length);
        for(var i = 0; i < object.length; i++){
          var contributor = object[i];
          console.log(contributor.username + "|" + contributor.web_url + "|" + contributor.avatar_url);
          if(contributor.access_level === 40 || contributor.access_level === 50){
            project.owner.name = contributor.username;
            project.owner.url = contributor.web_url; // TODO: fraglich
            project.owner.image = contributor.avatar_url;
            break;
          }
        }

        callback(id, project);
      }else{
        throw new Error("Request: " + jsonString.message);
      }
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
    project.owner.name = object.namespace.name
    project.owner.url = ""
    project.owner.image = ""
    project.amount_contributors = 0;
    project.external_homepage = object.web_url;
    return project;
  }
};
