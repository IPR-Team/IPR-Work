var rowCounter = 0;
var currentPage = 1;
var elementsPerPage = 50;
var receivedProjects = 0;
var connectorCallbacks = 0;
var connectorAPIs = [];
var connectorManager = {};
var projects = [];
var sources = [];
var searchString = "";
var token_config = {}
token_config['GitHub'] = null; //"ca3e81dec2b846edb9d005e3a2727e131aae15fb"
token_config['GitLab'] = null; //"zsPXGhyv5Rn4ss9W7f2u"
token_config['Yandex'] = null; //"trnsl.1.1.20190113T111827Z.f1625132c6454630.d83702b62ef89556bccf67d9c4df672d2b4a7275"
isLoading = 0;
var date;

var createdDataCounter = 0; // is this used?

function addElementToTable(general, description, source, last_updated) {
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
  var projectLink = document.createElement('a');
  var projectUrl = document.createTextNode(general.url);
  projectLink.setAttribute('href', general.url);
  projectLink.appendChild(projectUrl);
  nameCell.appendChild(projectName);
  nameCell.appendChild(document.createElement("br"));
  nameCell.appendChild(projectLink);

  var descriptionCell = newRow.insertCell(2);
  var descriptionElement;
  if (description == null) {
    descriptionElement = document.createTextNode("-");
  } else {
    descriptionElement = document.createTextNode(description);
  }
  descriptionCell.appendChild(descriptionElement);

  var translateCell = newRow.insertCell(3);
  var translateButton = document.createElement("button");
  translateButton.className = "translate-button";
  var translateElement = document.createTextNode("Translate description");
  translateElement.className = "translate-text";
  translateButton.appendChild(translateElement);
  document.body.appendChild(translateButton);
  translateCell.appendChild(translateButton);
  translateButton.addEventListener('click', translateButtonClicked, true);


  var sourceCell = newRow.insertCell(4);
  var sourceElement = document.createTextNode(source);
  sourceCell.appendChild(sourceElement);

  var updatedCell = newRow.insertCell(5);
  var updatedElement = document.createTextNode(last_updated);
  updatedCell.appendChild(updatedElement);
}

function translateAllButtonClicked() {
  var translateAllId = ((currentPage - 1) * elementsPerPage) + 1;
  var languages = document.getElementById("LanguageSelection");
  var languageCode = languages.options[languages.selectedIndex].value;
  translateAPI = new TextTranslator(token_config['Yandex']);
  if (languageCode === "") {
    window.alert("First select language to translate.");

  } else {
    for (translateAllId; translateAllId < rowCounter + 1; translateAllId++) {
      var description = document.getElementById(translateAllId).getElementsByTagName("td")[2].innerHTML;
      if (description == null) {
        description = "-";
      }
      translateAPI.translateText(description, languageCode, translateAllId, translatedText);

    }
  }
}

function translateButtonClicked(element) {
  var languages = document.getElementById("LanguageSelection");
  var languageCode = languages.options[languages.selectedIndex].value;
  var id = element.target.parentElement.parentElement.id;
  var description = document.getElementById(id).getElementsByTagName("td")[2].innerHTML;
  translateAPI = new TextTranslator(token_config['Yandex']);
  if (languageCode === "") {
    window.alert("First select language to translate.");
    element.stopPropagation();
  } else {
    translateAPI.translateText(description, languageCode, id, translatedText);
    element.stopPropagation();
  }
  return;
}

function translatedText(id, resultString) {
  if (resultString == null) {
    return;
  }
  document.getElementById(id).getElementsByTagName("td")[2].innerHTML = resultString;
}

function processConfiguration() {
  var dict = new Object();
  dict['ghTokenInput'] = 40;
  dict['glTokenInput'] = 20;
  dict['ydTokenInput'] = 84;
  for (var key in dict) {
    var value = document.getElementById(key).value;
    if (key == 'ghTokenInput') {
      token_config['GitHub'] = value;
    } else if (key == 'glTokenInput') {
      token_config['GitLab'] = value;
    } else if (key == 'ydTokenInput') {
      token_config['Yandex'] = value;
    }
    if (value.length < dict[key]) {
      return false;
    }
  }
  return true;
}

function tableElementClicked(element) {
  if (isLoading == 1) {
    window.alert("Another request is still in progress...");
    return;
  } else {
    isLoading = 1;
  }
  var id = element.target.parentElement.id;
  console.log(id);
  var selectedProject = projects[id - 1];
  var selectedRow = document.getElementById(id);
  if (document.getElementsByClassName("extended-tablecell").length > 0) {
    if (selectedRow.classList.contains("extended-tablecell")) {
      document.getElementById("extended-details").remove();
      selectedRow.classList.remove("extended-tablecell");
      isLoading = 0;
      return;
    } else {
      closeExtendedDetails();
    }
  }
  selectedRow.className = "extended-tablecell";
  var connector;
  if (selectedProject.source == "GitHub" || selectedProject.source == "GitLab") {
    if (selectedProject.source == "GitHub") {
      connector = getSourceConnector("GitHub");
    } else {
      connector = getSourceConnector("GitLab");
    }
    try {
      connector.getProjectDetails(id, selectedProject, extendContent);
    } catch (e) {
      if (e instanceof SyntaxError) {
        selectedProject.amount_contributors = 0;
      }
    }
  } else {
    extendContent(id, selectedProject);
  }
}

function closeExtendedDetails() {
  var extendedRow = document.getElementsByClassName("extended-tablecell");
  var details = document.getElementById("extended-details");
  if (details != null) {
    details.remove();
  }
  extendedRow[0].classList.remove("extended-tablecell");
}

function getSourceConnector(source) {
  var connector;
  for (var i = 0; i < connectorAPIs.length; i++) {
    connector = connectorAPIs[i];
    switch (source) {
      case "GitHub":
        if (connector instanceof GitHubAPIConnector) {
          return connector;
        }
        break;
      case "GitLab":
        if (connector instanceof GitLabAPIConnector) {
          return connector;
          break;
        }
    }
  }
}

function extendContent(id, project) {
  //
  if (id >= elementsPerPage) {
    id = id % elementsPerPage;
    if (id == 0) {
      id = elementsPerPage;
    }
  }
  var table = document.getElementById("resultTable").getElementsByTagName('tbody')[0];
  var newRow = table.insertRow(id);
  newRow.setAttribute("id", "extended-details");
  var projectDetails = newRow.insertCell(0);
  projectDetails.colSpan = "8";
  var detailsContainer = document.createElement("div");
  detailsContainer.className = "details-container";

  var ownerContainer = document.createElement("div");
  ownerContainer.className = "owner-container";
  var ownerHeader = document.createElement("div");
  ownerHeader.className = "owner-header";
  ownerHeader.innerHTML = "Project owner:";
  var ownerImage = document.createElement("img");
  ownerImage.className = "picture";
  ownerImage.setAttribute("src", project.owner.image);
  var ownerName = document.createElement("div");
  ownerName.className = "owner-name";
  ownerName.innerHTML = project.owner.name;
  var ownerLink = document.createElement("a");
  var lineBreak = document.createElement("br");
  var ownerUrl = document.createElement("div");
  ownerUrl.innerHTML = project.owner.url;
  ownerLink.setAttribute('href', project.owner.url);
  ownerLink.appendChild(ownerUrl);
  ownerLink.className = "owner-url";
  ownerContainer.appendChild(ownerHeader);
  ownerContainer.appendChild(ownerImage);
  ownerContainer.appendChild(ownerName);
  ownerContainer.appendChild(lineBreak);
  ownerContainer.appendChild(ownerLink);

  var contributorsContainer = document.createElement("div");
  contributorsContainer.className = "contributors-container"
  var contributorsHeader = document.createElement("div");
  contributorsHeader.innerHTML = "Amount of contributors:";
  contributorsHeader.className = "contributors-header";
  var contributorsElement = document.createElement("div");
  if (typeof project.amount_contributors == "undefined") {
    contributorsElement.innerHTML = "0";
  } else {
    contributorsElement.innerHTML = project.amount_contributors;
  }
  contributorsElement.className = "contributors";
  contributorsContainer.appendChild(contributorsHeader);
  contributorsContainer.appendChild(contributorsElement);

  var homepageContainer = document.createElement("div");
  homepageContainer.className = "homepageContainer";
  var homepageHeader = document.createElement("div");
  homepageHeader.innerHTML = "External homepage:";
  homepageHeader.className = "homepage-header";
  var homepageElement;
  var externalHomepage;
  if (project.external_homepage == null) {
    externalHomepage = document.createElement("div");
    externalHomepage.innerHTML = "-";
  } else {
    externalHomepage = document.createElement('a');
    homepageElement = document.createElement("div");
    homepageElement.innerHTML = project.external_homepage;
    externalHomepage.setAttribute('href', project.external_homepage);
    externalHomepage.appendChild(homepageElement);
  }
  externalHomepage.className = "homepage";
  homepageContainer.appendChild(homepageHeader);
  homepageContainer.appendChild(externalHomepage);

  detailsContainer.appendChild(ownerContainer);
  detailsContainer.appendChild(contributorsContainer);
  detailsContainer.appendChild(homepageContainer);
  projectDetails.appendChild(detailsContainer);
  isLoading = 0;
}
//Will be accessed by connectors!
function addProjectToTable(project) {
  addElementToTable(project.general, project.description, project.source, project.last_updated);
  //save porjects in ram for later proposals?
}

function sortProjects(newProjects) {
  newProjects.sort(function(a, b) {
    return a.last_updated < b.last_updated
  });
  projects = projects.concat(newProjects);
  receivedProjects += newProjects.length;
  if (connectorCallbacks == connectorAPIs.length) {
    console.log("Added " + receivedProjects + " items to main");
    getExistingProjects(rowCounter);
  }
}

function clearTable() {
  document.getElementById("resultTable").getElementsByTagName('tbody')[0].innerHTML = "";
}

function processSearchString(searchString) {
  return searchString.replace(/[^\w\d]+/g, " ").trim().toLowerCase().replace(/\s+/g, "+");
}

function toggleResultTable(showTable) {
  var table = document.getElementById("resultArea");
  if (showTable) {
    table.style.display = "block";
    checkPages();
    updateDisplayedPage()
  } else {
    table.style.display = "none";
  }
}

function toggleSearchingIndicator(showIndicator) {
  var searchingIndicator = document.getElementById("searchingIndicator");
  if (showIndicator) {
    searchingIndicator.style.display = "block";
  } else {
    searchingIndicator.style.display = "none";
  }
}

function searchButtonClicked() {
  translateAllId = 1;
  if (!processConfiguration()) {
    window.alert("Error on configuration. Be sure to add valid access tokens to configuration first to perform a search.");
    return
  }
  searchString = processSearchString(document.getElementById("input").value);
  if (searchString == "") {
    return;
  }
  sources = [];
  projects = [];
  connectorAPIs = [];
  connectorManager = new ConnectorManager(token_config['GitHub'], token_config['GitLab']);

  getSources();
  getConnectors();
  currentPage = 1;
  maxPage = 1;
  receivedProjects = 0;
  rowCounter = 0;
  date = new Date(Date.now()).toISOString().replace(/[\..+Z]+/g, "+00:00");
  document.getElementById("lastSearchedOutput").innerHTML = searchString;
  initiateSearch();
}

function initiateSearch() {
  toggleResultTable(false);
  clearTable();
  connectorCallbacks = 0;
  for (var i = 0; i < connectorAPIs.length; i++) {
    connectorAPIs[i].searchForProjects(searchString, elementsPerPage, currentPage, date, prepareTable);
  }
  toggleSearchingIndicator(true);
}

function getExistingProjects(startRow) {
  toggleResultTable(false);
  toggleSearchingIndicator(true);
  clearTable();
  receivedProjects = 0;
  for (var i = startRow; i < currentPage * elementsPerPage; i++) {
    if (typeof projects[i] == "undefined") {
      break;
    } else {
      receivedProjects++;
      addProjectToTable(projects[i]);
    }
  }
  checkPages();
  toggleSearchingIndicator(false);
  toggleResultTable(true);
}

function getConnectors() {
  for (var i = 0; i < sources.length; i++) {
    connectorAPIs.push(connectorManager.getConnector(sources[i]));
  }
}

function prepareTable(projects) {
  if (projects == null || projects.length == 0) {
    return;
  }
  connectorCallbacks++;
  sortProjects(projects);
  if (connectorCallbacks == connectorAPIs.length) {
    toggleSearchingIndicator(false);
    toggleResultTable(true);
  }
}

function getSources() {
  var checkboxes = document.getElementsByName('source');
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      sources.push(checkboxes[i].id);
    }
  }
}

function checkPages() {
  var previousButtons = document.getElementsByClassName("previous-page");
  var nextButtons = document.getElementsByClassName("next-page");
  if (currentPage == 1) {
    for (var i = 0; i < previousButtons.length; i++) {
      previousButtons[i].className = "page-button-disabled previous-page";
    }
  } else {
    for (var i = 0; i < previousButtons.length; i++) {
      previousButtons[i].className = "page-button previous-page";
    }
  }
  if (receivedProjects < elementsPerPage) {
    for (var i = 0; i < nextButtons.length; i++) {
      nextButtons[i].className = "page-button-disabled next-page";
    }
  } else {
    for (var i = 0; i < nextButtons.length; i++) {
      nextButtons[i].className = "page-button next-page";
    }
  }
}

function getNextPage() {
  if (document.getElementsByClassName("extended-tablecell").length > 0) {
    closeExtendedDetails();
  }
  if (document.getElementsByClassName("next-page")[0].classList.contains("page-button-disabled")) {
    return;
  }
  currentPage++;
  if ((currentPage * elementsPerPage) > projects.length) {
    initiateSearch();
  } else {
    getExistingProjects(rowCounter);
  }
}

function getPreviousPage() {
  if (document.getElementsByClassName("extended-tablecell").length > 0) {
    closeExtendedDetails();
  }
  if (document.getElementsByClassName("previous-page")[0].classList.contains("page-button-disabled")) {
    return;
  }
  currentPage--;
  rowCounter = (currentPage - 1) * elementsPerPage;
  getExistingProjects(rowCounter);
}

function updateDisplayedPage() {
  var pageLabels = document.getElementsByClassName("displayed-page");
  for (var i = 0; i < pageLabels.length; i++) {
    pageLabels[i].innerHTML = currentPage;
  }
}
