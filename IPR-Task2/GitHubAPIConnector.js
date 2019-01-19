/**
  GitHubAPIConnector handles request to GitHub API to receive different data of projects.
  In order to perform a general search for projects with a specific name
  it provides a function to handles this aspect. But this function only turn back
  general data of projects. To get detailed information about a project
  there is a second function.
  @author H.Tanke
  @version 1.0
*/
function GitHubAPIConnector(token) {
  var statusCode = 200;
  var privatToken = token;

  /**
  Use this function to perform a general search for projects in GitHub. This supports
  pagination.
  @param search_string projects will be choosen by means of this string
  @param amount_of_results max results the api should turn back on request
  @param page the part of the results which are requested.
  @param createdBeforeDate request will turn back projects only ealier then this param
  @param callback a function where results will inserted
  */
  this.searchForProjects = function(search_string, amount_of_results, page, createdBeforeDate, callback) {
    var url = "https://api.github.com/search/repositories";
    var query = "?q=".concat(search_string);
    var created = "&created%3A<".concat(createdBeforeDate);
    var accessToken = "&access_token=" + privatToken; //ca3e81dec2b846edb9d005e3a2727e131aae15fb
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

  /**
    Use this function to get more detailed informations of one project.
    @param id identifier for matching results
    @param project porject object which already holds a bunch of information
    @param callback a function where full project info will be inserted
  */
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

  /**
  GitHub stores a large amount of project and thier data. Sometimes processing a search
  on this data set took to long. In this case a request will just start process.
  More request are needed to get processed data / found projects.
  This function request API rekursive until a request turns data back or a timeout has reached.
  @param url url for request
  @param timeout_counter amount of request failing until abored.
  @param id identifier for matching results
  @param project porject object which already holds a bunch of information
  @param callback a function where full project info will be inserted
  */
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

  /**
   Sometimes author create descriptions with many whitespace, tabs, returns or newlines
   to outline special information or present text in an own format. This special characters
   are unnecessary informations and will be cutted out by this function. This saves memory.
   @param description description string of project with maybe this special characters.
  */
  var processDescription = function(description) {
    if (description != null) {
      description = description.replace(/[\s\r\n\t]+/g, " "); //regex -> check me on regexr.com
    }
    return description;
  }

  /**
    Not all informations of a project are necessary. This function filters those informations
    and match the necesarry ones in a project object
    @param object js object with all informations of a project
    @return project object with necessary informations
  */
  var parseObjectToProjectData = function(object) {
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
