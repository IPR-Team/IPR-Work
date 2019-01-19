/**
  GitLabAPIConnector handles request to GitLab API to receive different data of projects.
  In order to perform a general search for projects with a specific name
  it provides a function to handles this aspect. But this function only turn back
  general data of projects. To get detailed information about a project
  there is a second function.
  @author H.Tanke, P. Mitzlaff
  @version 1.0
*/
function GitLabAPIConnector(token) {
  var privateToken = token;
  var encoder = new TextEncoder();
  var statusCode = 200;

  /**
  Use this function to perform a general search for projects in GitLab. This supports
  pagination.
  @param search_string projects will be choosen by means of this string
  @param amount_of_results max results the api should turn back on request
  @param page the part of the results which are requested.
  @param createdBeforeDate request will turn back projects only ealier then this param
  @param callback a function where results will inserted
  */
  this.searchForProjects = function(search_string, amount_of_results, page, createdBeforeDate, callback) {
    s
    var url = "https://gitlab.com/api/v4/search";
    var query = "&search=".concat(search_string);
    var scope = "?scope=projects";
    var accessToken = "&private_token=" + privateToken;
    var maxResults = "&per_page=" + amount_of_results;
    var page = "&page=" + page;
    var url = url.concat(scope, query, accessToken, maxResults, page);
    var pullProjectResponse = [];
    fetch(url)
      .then(function(response) {
        statusCode = response.status;
        return response.json();
      })
      .then(function(jsonString) {
        if (statusCode < 299 && statusCode >= 200) {
          var object = jsonString;
          console.log("Received " + object.length + " items");
          for (i = 0; i < object.length; i++) {
            pullProjectResponse.push(parseObjectToProjectData(object[i]));
          }
          callback(pullProjectResponse);
        } else {
          window.alert("There was an error loading the data. Possibly the request limit has been reached.");
          console.log("Error during request: " + jsonString.message);
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
    var url = "https://gitlab.com/api/v4"
    var accessToken = "?private_token=zsPXGhyv5Rn4ss9W7f2u";
    var specificPath = encoder.EncodeUrl(project.owner.name.concat("/", project.general.name.replace(/[\s]/g, "-")));
    var query = "/projects/".concat(specificPath, "/members");
    url = url.concat(query, accessToken);
    fetch(url)
      .then(function(response) {
        console.log("Requested: " + url);
        statusCode = response.status;
        return response.json();
      })
      .then(function(jsonString) {
        if (statusCode < 299 && statusCode >= 200) {
          var object = jsonString;
          project.amount_contributors = object.length;
          var owner = {};
          console.log("Received items: " + object.length);
          for (var i = 0; i < object.length; i++) {
            var contributor = object[i];
            console.log(contributor.username + "|" + contributor.web_url + "|" + contributor.avatar_url);
            if (contributor.access_level === 40 || contributor.access_level === 50) {
              project.owner.name = contributor.username;
              project.owner.url = contributor.web_url; // TODO: fraglich
              project.owner.image = contributor.avatar_url;
              break;
            }
          }
          callback(id, project);
        } else {
          window.alert("There was an error loading the data. Possibly the request limit has been reached.");
          console.log("Error during request: " + jsonString.message)
          callback(id, project);
        }
      })
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