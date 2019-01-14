// // TODO: NextPage muss abhängig von der projects.length sein, nicht von der maxPage
var rowCounter = 0;
var currentPage = 1;
var elementsPerPage = 50;
var receivedProjects = 0;
var connectorCallbacks = 0;
var connectorAPIs = [];
var projects = [];
var sources = [];
var searchString = "";
var date;

var createdDataCounter = 0; // is this used?

function addElementToTable(general, description, source, last_updated){
  rowCounter++;
  var table = document.getElementById("resultTable").getElementsByTagName('tbody')[0];
  var newRow = table.insertRow(table.rows.length);
  newRow.setAttribute("id", rowCounter);
  newRow.addEventListener('click', tableElementClicked, false);

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
}

function tableElementClicked(element){
  var id = element.target.parentElement.id;
  var selectedProject = projects[id-1];
  var selectedRow = document.getElementById(id);
  if(selectedRow.classList.contains("extended-tablecell")){
    document.getElementById("extended-details").remove();
    selectedRow.classList.remove("extended-tablecell");
    return;
  }else{
    closeExtendedDetails();
  }
  selectedRow.className = "extended-tablecell";
  var connector;
  if(selectedProject.source == "GitHub"){
    connector = getSourceConnector("GitHub");
    connector.getProjectDetails(id, selectedProject, extendContent);
    //extendContent(id, selectedProject);
  }else{
    extendContent(id, selectedProject);
  }
}

function closeExtendedDetails(){
  var extendedRow = document.getElementsByClassName("extended-tablecell");
  if(extendedRow.length > 0){
    document.getElementById("extended-details").remove();
    extendedRow[0].classList.remove("extended-tablecell");
  }
}

function getSourceConnector(source){
  var connector;
  for(var i = 0; i < connectorAPIs.length; i++){
    connector = connectorAPIs[i];
    switch(source){
      case "GitHub":
        if( connector instanceof GitHubAPIConnector){
          return connector;
        }
        break;
      case "GitLab":
        if( connector instanceof GitLabAPIConnector){
          return connector;
          break;
        }
    }
  }
}

function extendContent(id, project){
  if(id > elementsPerPage){
    id = id % elementsPerPage;
  }
  var table = document.getElementById("resultTable").getElementsByTagName('tbody')[0];
  var newRow = table.insertRow(id);
  newRow.setAttribute("id", "extended-details");

  var projectDetails = newRow.insertCell(0);
  projectDetails.colSpan = "8";

  var detailsContainer = document.createElement('div');
  detailsContainer.className = "details-container";

  var ownerHeader = document.createTextNode("Project owner:");
  ownerHeader.className = "picheader";

  var ownerName = document.createTextNode(project.owner.name);
  ownerName.className = "name";

  var ownerUrl = document.createTextNode(project.owner.url);
  ownerUrl.className = "url";

  var ownerImage = document.createElement("img");
  ownerImage.className = "picture";
  ownerImage.setAttribute("src", project.owner.image);

  var contributorsHeader = document.createTextNode("Amount of contributors:");
  contributorsHeader.className = "contributorsheader";

  var contributorsElement;
  if(typeof project.amount_contributors == "undefined"){
    contributorsElement = document.createTextNode("0");
  }else{
    contributorsElement = document.createTextNode(project.amount_contributors);
  }
  contributorsElement.className = "contributors";

  var homepageHeader = document.createTextNode("External homepage:");
  homepageHeader.className = "homepageheader";

  var homepageElement;
  if(project.external_homepage == null){
    homepageElement = document.createTextNode("-");
  }else{
    homepageElement = document.createTextNode(project.external_homepage);
  }
  homepageElement.className = "homepage";

  detailsContainer.appendChild(ownerHeader);
  detailsContainer.appendChild(ownerName);
  detailsContainer.appendChild(ownerUrl);
  detailsContainer.appendChild(ownerImage);
  detailsContainer.appendChild(contributorsHeader);
  detailsContainer.appendChild(contributorsElement);
  detailsContainer.appendChild(homepageHeader);
  detailsContainer.appendChild(homepageElement);
  projectDetails.appendChild(detailsContainer);
}

//Will be accessed by connectors!
function addProjectToTable(project){
  addElementToTable(project.general, project.description, project.source, project.last_updated);
    //save porjects in ram for later proposals?
}

function matchAndSortProjects(newProjects){
  projects = projects.concat(newProjects);
  projects.sort(function(a, b){ return a.last_updated < b.last_updated });
  receivedProjects += newProjects.length;
  if(connectorCallbacks == connectorAPIs.length){
    while(newProjects.length > 0){
      addProjectToTable(newProjects.shift());
    }
    console.log("Added " + receivedProjects + " items to main");
  }
}

function clearTable(){
  document.getElementById("resultTable").getElementsByTagName('tbody')[0].innerHTML = "";
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
  sources = [];
  projects = [];
  connectorAPIs = [];

  getSources();
  getConnectors();
  currentPage = 1;
  maxPage = 1;
  receivedProjects = 0;
  rowCounter = 0;

  searchString = processSearchString(document.getElementById("input").value);
  date = new Date(Date.now()).toISOString().replace(/[\..+Z]+/g,"+00:00");
  document.getElementById("lastSearchedOutput").innerHTML = searchString;
  initiateSearch();
}

function initiateSearch(){
  toggleResultTable(false);
  clearTable();
  connectorCallbacks = 0;
  for(var i = 0; i < connectorAPIs.length; i++){
    connectorAPIs[i].searchForProjects(searchString, elementsPerPage, currentPage, date, prepareTable);
  }
  toggleSearchingIndicator(true);
}

function getExistingProjects(startRow){
  toggleResultTable(false);
  toggleSearchingIndicator(true);
  clearTable();
  receivedProjects = 0;
  for(var i = startRow; i < currentPage * elementsPerPage; i++){
    if(typeof projects[i] == "undefined"){
      break;
    }else{
      receivedProjects++;
      addProjectToTable(projects[i]);
    }
  }
  checkPages();
  toggleSearchingIndicator(false);
  toggleResultTable(true);
}

function getConnectors(){
  for(var i = 0; i < sources.length; i++){
    connectorAPIs.push(getConnector(sources[i]));
  }
}

function prepareTable(projects){
  connectorCallbacks++;
  matchAndSortProjects(projects);
  if(connectorCallbacks == connectorAPIs.length){
    toggleSearchingIndicator(false);
    toggleResultTable(true);
  }
}

function getSources(){
  var checkboxes = document.getElementsByName('source');
  for (var i = 0; i < checkboxes.length; i++){
    if (checkboxes[i].checked){
      sources.push(checkboxes[i].id);
    }
  }
}

function checkPages(){
  var previousButtons = document.getElementsByClassName("previous-page");
  var nextButtons = document.getElementsByClassName("next-page");
  if(currentPage == 1){
    for(var i = 0; i < previousButtons.length; i++){
      previousButtons[i].className = "page-button-disabled previous-page";
    }
  }else{
    for(var i = 0; i < previousButtons.length; i++){
      previousButtons[i].className = "page-button previous-page";
    }
  }
  if(receivedProjects < elementsPerPage){
    for(var i = 0; i < nextButtons.length; i++){
      nextButtons[i].className = "page-button-disabled next-page";
    }
  }else{
    for(var i = 0; i < nextButtons.length; i++){
      nextButtons[i].className = "page-button next-page";
    }
  }
}

function getNextPage(){
  closeExtendedDetails();
  if(document.getElementsByClassName("next-page")[0].classList.contains("page-button-disabled")){
    return;
  }
  currentPage++;
  if((currentPage * elementsPerPage) > projects.length){
    initiateSearch();
  }else{
    getExistingProjects(rowCounter);
  }
}

function getPreviousPage(){
  closeExtendedDetails();
  if(document.getElementsByClassName("previous-page")[0].classList.contains("page-button-disabled")){
    return;
  }
  currentPage--;
  rowCounter = (currentPage-1)*elementsPerPage;
  getExistingProjects(rowCounter);
}

function updateDisplayedPage(){
  var pageLabels = document.getElementsByClassName("displayed-page");
  for(var i = 0; i < pageLabels.length; i++){
    pageLabels[i].innerHTML = currentPage;
  }
}
