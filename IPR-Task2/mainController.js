var rowCounter = -1;
var createdDataCounter = 0;
var projects = [];

function addElementToTable(general, description, source, last_updated, owner, amount_contributors, external_homepage){
  rowCounter = rowCounter + 1;
  var newRow = document.createElement("tr");
  newRow.setAttribute("id", "row".concat(rowCounter));

  var numberElement = document.createElement("td");
  numberElement.innerHTML = rowCounter;

  var nameElement = document.createElement("td");
  nameElement.innerHTML = general.name.concat("<br/>", general.url);

  var descriptionElement = document.createElement("td");
  descriptionElement.innerHTML = description;

  var sourceElement = document.createElement("td");
  sourceElement.innerHTML = source;

  var lastUpdatedElement = document.createElement("td");
  lastUpdatedElement.innerHTML = last_updated;

  var ownerElement = document.createElement("td");
  var userDescription = document.createElement("p");
  var image = document.createElement("img");
  image.setAttribute("src", owner.image);
  image.setAttribute("id", "picture");
  userDescription.innerHTML = owner.name.concat("<br/>", owner.url);
  ownerElement.appendChild(image);
  ownerElement.appendChild(userDescription);

  var amountContributorsElement = document.createElement("td");
  amountContributorsElement.innerHTML = amount_contributors;

  var externalHomepageElement = document.createElement("td");
  externalHomepageElement.innerHTML = external_homepage;

  newRow.appendChild(numberElement);
  newRow.appendChild(nameElement);
  newRow.appendChild(descriptionElement);
  newRow.appendChild(sourceElement);
  newRow.appendChild(lastUpdatedElement);
  newRow.appendChild(ownerElement);
  newRow.appendChild(amountContributorsElement);
  newRow.appendChild(externalHomepageElement);
  document.getElementById("resultTable").appendChild(newRow);
}

//Will be accessed by connectors!
function addProjectToTable(project){
  addElementToTable(project.general, project.description, project.source, project.last_updated,
    project.owner, project.amount_contributors, project.external_homepage);
    //save projects in ram for later proposals? -> Is not needed. All data will be shown on html page
    //and can be accessed there
}

//callback for connectors to access main thread directly. -> Modularity
function matchAndSortProjects(projectList){
  projectList.sort(function(a, b){ return a.last_updated < b.last_updated });
  while(projectList.length > 0){
    var projectItem = projectList.shift();
    addProjectToTable(projectItem);
  }
  console.log("Added " + rowCounter + " items to main");
}

//clear table
function clearTable(){
  if(rowCounter > 0){
    while(rowCounter >= 0){
      var child = document.getElementById("row".concat(rowCounter));
      child.remove();
      rowCounter--;
    }
  }
}

//simplify search string for search algorithmns of APIs
function processSearchString(searchString){
  var newSearchString = searchString.replace(/[^\w\d]+/g," ");
  newSearchString = newSearchString.trim().toLowerCase();
  newSearchString = newSearchString.replace(/\s+/g,"+");
  return newSearchString;
}

//Do not show table before any result is available.
function showResultTable(value){
  var table = document.getElementById("resultArea");
  if(value === true){
    table.style.display = "block";
  }else{
    table.style.display = "none";
  }
}

//While searching something should indicate, that app is still running and
//is not blocked.
function showSearchingIndicator(value){
  var searchingIndicator = document.getElementById("resultArea");
  if(value === true){
    searchingIndicator.style.display = "block";
  }else{
    searchingIndicator.style.display = "none";
  }
}

function searchButtonClicked(){
  var source;
  showResultTable(false);
  clearTable();
  if(document.getElementById("bitBucketRadioButton").checked == true){
    source = "BitBucket";
  }else if(document.getElementById("gitHubRadioButton").checked == true){
    source = "GitHub";
  }else if(document.getElementById("gitLabRadioButton").checked == true){
    source = "GitLab";
  }
  var searchString = document.getElementById("input").value;
  document.getElementById("input").value = "";
  document.getElementById("lastSearchedOutput").innerHTML = searchString;
  searchString = processSearchString(searchString);
  searchForProjects(searchString, source, function(e){
    showSearchingIndicator(false);
    showResultTable(true);
    matchAndSortProjects(e);
  });
  showSearchingIndicator(true);
}
