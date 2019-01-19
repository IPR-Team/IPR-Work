//Constructor and Class
function GitHubAPIConnector(token) {
  var statusCode = 200;
  var privatToken = token;
  //public function of object GitHubAPIConnector / each kind of connector do need this function!!!
  this.searchForProjects = function(search_string, amount_of_results, page, createdBeforeDate, callback) {
    //Header: link - ...    auswerten für maximale Anzahl der Seiten
    var url = "https://api.github.com/search/repositories";
    var query = "?q=".concat(search_string);
    var created = "&created%3A<".concat(createdBeforeDate);
    var accessToken = "&?access_token=" + privatToken; //ca3e81dec2b846edb9d005e3a2727e131aae15fb
    var maxResults = "&per_page=" + amount_of_results;
    var page = "&page=" + page;
    var sort = "&sort=updated";
    var url = url.concat(query, created, accessToken, maxResults, page, sort);
    var pullProjectResponse = [];
    fetch(url)
      .then(function(response) {
        console.log("Requested: " + url);
        statusCode = response.status;
        return response.json();
      })
      .then(function(jsonString) {
        if (statusCode < 299 && statusCode >= 200) {
          var object = jsonString.items;
          console.log("Received " + object.length + " items");
          for (i = 0; i < object.length; i++) {
            pullProjectResponse.push(parseObjectToProjectData(object[i]));
          }
          callback(pullProjectResponse);
        } else {
          window.alert("There was an error loading the data. Possibly the request limit has been reached.");
          console.log("Error during request: " + jsonString.message)
          callback(null);
        }
      })
  }

  //use this function to get complete data set of a project
  this.getProjectDetails = function(id, project, callback) {
    var url = "https://api.github.com"
    var accessToken = "?access_token=" + privatToken;
    var query = "/repos/".concat(project.owner.name, "/", project.general.name, "/stats/contributors")
    url = url.concat(query, accessToken);
    fetch(url)
      .then(function(response) {
        console.log("Requested: " + url);
        statusCode = response.status;
        return response.json();
      })
      .then(function(object) {
        if (statusCode == 202) {
          var timeout_counter = 0;
          renew_request(url, timeout_counter, id, project, callback)
        } else if (statusCode < 299 && statusCode >= 200) {
          project.amount_contributors = object.length;
          callback(id, project);
        } else {
          window.alert("There was an error loading the data. Possibly the request limit has been reached.");
          console.log("Error during request: " + statusCode + " " + object.message);
          project.amount_contributors = 0;
          callback(id, project);
        }
      })
  }

  var renew_request = function(url, timeout_counter, id, project, callback) {
    if (timeout_counter > 5) {
      window.alert("Time out on updateting project info");
      callback(id, project)
    } else {
      fetch(url)
        .then(function(response) {
          console.log("Requested again: " + url);
          statusCode = response.status;
          return response.json();
        })
        .then(function(object) {
          if (statusCode == 202) {
            timeout_counter = timeout_counter + 1;
            renew_request(url, timeout_counter, id, project, callback)
          } else if (statusCode < 299 && statusCode >= 200) {
            project.amount_contributors = object.length;
            callback(id, project);
          } else {
            window.alert("There was an error loading the data. Possibly the request limit has been reached.");
            console.log("Error during request: " + statusCode + " " + object.message);
            project.amount_contributors = 0;
            callback(id, project);
          }
        })
    }
  }

  //private function: Shortened description by triming full string
  var processDescription = function(description) {
    if (description != null) {
      description = description.replace(/[\s\r\n\t]+/g, " "); //regex -> check me on regexr.com
    }
    return description;
  }

  var parseObjectToProjectData = function(object) {
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