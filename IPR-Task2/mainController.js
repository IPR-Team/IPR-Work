var rowCounter = 0;
var currentPage = 1;
var createdDataCounter = 0;
var projects = [];
var connectorAPI;

function addElementToTable(general, description, source, last_updated, owner, amount_contributors, external_homepage){
  rowCounter = rowCounter + 1;
  var table = document.getElementById("resultTable").getElementsByTagName('tbody')[0];
  var newRow = table.insertRow(table.rows.length);
  newRow.setAttribute("id", "row".concat(rowCounter));

  var idCell = newRow.insertCell(0);
  var idElement = document.createTextNode(rowCounter);
  idCell.appendChild(idElement);

  var nameCell = newRow.insertCell(1);
  var projectName = document.createTextNode(general.name);
  var projectUrl = document.createTextNode(general.url);
  nameCell.appendChild(projectName);
  nameCell.appendChild(document.createElement("br"));
  nameCell.appendChild(projectUrl);

  var descriptionCell = newRow.insertCell(2);
  var descriptionElement;
  if(description == null){
    descriptionElement = document.createTextNode("-");
  }else{
	descriptionElement = document.createTextNode(description);
  }
  descriptionCell.appendChild(descriptionElement);

  var sourceCell = newRow.insertCell(3);
  var sourceElement = document.createTextNode(source);
  sourceCell.appendChild(sourceElement);

  var updatedCell = newRow.insertCell(4);
  var updatedElement = document.createTextNode(last_updated);
  updatedCell.appendChild(updatedElement);

  var ownerCell = newRow.insertCell(5);
  var ownerName = document.createTextNode(owner.name);
  var ownerUrl = document.createTextNode(owner.url);
  var ownerImage = document.createElement("img");
  ownerImage.setAttribute("src", owner.image);
  ownerImage.setAttribute("id", "picture");
  ownerCell.appendChild(ownerImage);
  ownerCell.appendChild(document.createElement("br"));
  ownerCell.appendChild(ownerName);
  ownerCell.appendChild(document.createElement("br"));
  ownerCell.appendChild(ownerUrl);

  var contributorsCell = newRow.insertCell(6);
  var contributorsElement = document.createTextNode(amount_contributors);
  contributorsCell.appendChild(contributorsElement);

  var homepageCell = newRow.insertCell(7);
  var homepageElement;
  if(external_homepage == null){
    homepageElement = document.createTextNode("-");
  }else{
    homepageElement = document.createTextNode(external_homepage);
  }
  homepageCell.appendChild(homepageElement);
}

//Will be accessed by connectors!
function addProjectToTable(project){
  addElementToTable(project.general, project.description, project.source, project.last_updated,
    project.owner, project.amount_contributors, project.external_homepage);
    //save porjects in ram for later proposals?
}

function matchAndSortProjects(projectList){
  projectList.sort(function(a, b){ return a.last_updated < b.last_updated });
  while(projectList.length > 0){
    var projectItem = projectList.shift();
    addProjectToTable(projectItem);
  }
  console.log("Added " + rowCounter + " items to main");
}

function clearTable(){
  if(rowCounter > 1){
    while(rowCounter >= 1){
      var child = document.getElementById("row".concat(rowCounter));
      child.remove();
      rowCounter--;
    }
  }
}

function processSearchString(searchString){
  var newSearchString = searchString.replace(/[^\w\d]+/g," ");
  newSearchString = newSearchString.trim().toLowerCase();
  newSearchString = newSearchString.replace(/\s+/g,"+");
  return newSearchString;
}

function showResultTable(value){
  var table = document.getElementById("resultArea");
  if(value === true){
	  table.style.display = "block";
    checkPages();
  }else{
	  table.style.display = "none";
  }
}

function showSearchingIndicator(value){
  var searchingIndicator = document.getElementById("searchingIndicator");
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
  updateDisplayedPage()

  if(document.getElementById("bitBucketRadioButton").checked == true){
    source = "BitBucket";
  }else if(document.getElementById("gitHubRadioButton").checked == true){
    source = "GitHub";
  }else if(document.getElementById("gitLabRadioButton").checked == true){
    source = "GitLab";
  }
  var searchString = document.getElementById("input").value;
  //document.getElementById("input").value = "";
  document.getElementById("lastSearchedOutput").innerHTML = searchString;
  searchString = processSearchString(searchString);
  connectorAPI = getConnector(source);
  connectorAPI.searchForProjects(searchString, 50, currentPage, function(e){
    matchAndSortProjects(e);
	  showSearchingIndicator(false);
	  showResultTable(true);
  });
  showSearchingIndicator(true);
}

function checkPages(){
  if(currentPage == 1){
    document.getElementById("previous-page").style.display = "none";
  }else{
    document.getElementById("previous-page").style.display = "flex";
  }
}

function getNextPage(){
  currentPage++;
  searchButtonClicked();
}
function getPreviousPage(){
  currentPage--;
  searchButtonClicked();
}

function updateDisplayedPage(){
  document.getElementById("displayed-page").innerHTML = currentPage;
}
