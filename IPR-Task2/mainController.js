var rowCounter = 0;
var currentPage = 1;
var maxPage = 1;
var elementsPerPage = 50;
var receivedProjects = 0;
var connectorAPI;
var projects = [];

var source = "";
var searchString = "";

var createdDataCounter = 0; // is this used?

function addElementToTable(general, description, source, last_updated, owner, amount_contributors, external_homepage){
  rowCounter++;
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

function matchAndSortProjects(newProjects){
  newProjects.sort(function(a, b){ return a.last_updated < b.last_updated });
  projects = projects.concat(newProjects);
  receivedProjects = newProjects.length;
  while(newProjects.length > 0){
    addProjectToTable(newProjects.shift());
  }
  console.log("Added " + receivedProjects + " items to main");
}

function clearTable(){
  document.getElementById("resultTable").getElementsByTagName('tbody')[0].innerHTML = "";
}
function clearProjects(){
  projects = [];
}

function processSearchString(searchString){
  return searchString.replace(/[^\w\d]+/g," ").trim().toLowerCase().replace(/\s+/g,"+");
}

function toggleResultTable(showTable){
  var table = document.getElementById("resultArea");
  if(showTable){
	  table.style.display = "block";
    checkPages();
    updateDisplayedPage()
  }else{
	  table.style.display = "none";
  }
}

function toggleSearchingIndicator(showIndicator){
  var searchingIndicator = document.getElementById("searchingIndicator");
  if(showIndicator){
    searchingIndicator.style.display = "block";
  }else{
    searchingIndicator.style.display = "none";
  }
}

function searchButtonClicked(){
  //clicking the search button will just reset the current page and the projects
  //the actual search for projects has to be sepreated from this function
  //because the getNextPage() can also initiate a search
  clearProjects();
  currentPage = 1;
  source = getSource();
  searchString = processSearchString(document.getElementById("input").value);
  document.getElementById("lastSearchedOutput").innerHTML = searchString;
  initiateSearch(searchString, source);
}
function initiateSearch(){
  toggleResultTable(false);
  clearTable();
  connectorAPI = getConnector(source);
  connectorAPI.searchForProjects(searchString, elementsPerPage, currentPage, prepareTable);
  toggleSearchingIndicator(true);
}
function getExistingProjects(startRow){
  toggleResultTable(false);
  toggleSearchingIndicator(true);
  clearTable();
  for(var i = startRow; i < currentPage * elementsPerPage; i++){
    if(typeof projects[i] == "undefined"){
      break;
    }else{
      addProjectToTable(projects[i]);
    }
  }
  toggleSearchingIndicator(false);
  toggleResultTable(true);
}
function prepareTable(projects){
  matchAndSortProjects(projects);
  toggleSearchingIndicator(false);
  toggleResultTable(true);
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
  if(currentPage > maxPage){
    maxPage = currentPage;
    initiateSearch();
  }else{
    getExistingProjects(rowCounter);
  }
}
function getPreviousPage(){
  currentPage--;
  rowCounter = (currentPage-1)*elementsPerPage;
  getExistingProjects(rowCounter);
}
function updateDisplayedPage(){
  document.getElementById("displayed-page").innerHTML = currentPage;
}
