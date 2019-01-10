var rowCounter = 0;
var currentPage = 1;
var elementsPerPage = 50;
var receivedProjects = 0;
var lastSource = "";
var lastInput = "";
var connectorAPI;

var projects = []; // is this used?
var createdDataCounter = 0; // is this used?

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
  receivedProjects = projectList.length;
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
    updateDisplayedPage()
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
  showResultTable(false);
  clearTable();
  var source = getSource();
  var searchString = document.getElementById("input").value;
  // resetting the page, if the user changes the source or the searched keyword while he already skipped through some pages
  if(lastSource != source || lastInput != searchString){
    lastSource = source;
    lastInput = searchString;
    currentPage = 1;
  }
  document.getElementById("lastSearchedOutput").innerHTML = searchString;
  searchString = processSearchString(searchString);
  connectorAPI = getConnector(source);
  connectorAPI.searchForProjects(searchString, elementsPerPage, currentPage, prepareTable);
  showSearchingIndicator(true);
}
function prepareTable(projects){
  matchAndSortProjects(projects);
  showSearchingIndicator(false);
  showResultTable(true);
}
function getSource(){
  var sources = document.getElementsByName('source');
  for (var i = 0; i < sources.length; i++){
    if (sources[i].checked){
      return sources[i].id;
    }
  }
}
function checkPages(){
  if(currentPage == 1){
    document.getElementById("previous-page").className = "page-button-disabled";
  }else{
    document.getElementById("previous-page").className = "page-button";
  }
  // THIS DOES NOT COVER ALL POSSIBILITES! EXAMPLE: elementsPerPage = 50 and the last page returns 50 elements
  // -> the website would still show the next page button
  // GitHub shows a totalcount of results, but I did not find something similar for GitLab
  if(receivedProjects < elementsPerPage){
    document.getElementById("next-page").className = "page-button-disabled";
  }else{
    document.getElementById("next-page").className = "page-button";
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
