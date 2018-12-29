var rowCounter = -1;
var createdDataCounter = 0;

function addNewElementToTable(name, brief, url){
  rowCounter++;
  var newRow = document.createElement("tr");
  newRow.setAttribute("id", "row".concat(rowCounter));
  var nameElement = document.createElement("td");
  nameElement.innerHTML = name;
  var briefElement = document.createElement("td");
  briefElement.innerHTML = brief;
  var urlElement = document.createElement("td");
  urlElement.innerHTML = url;
  newRow.appendChild(nameElement);
  newRow.appendChild(briefElement);
  newRow.appendChild(urlElement);
  document.getElementById("resultTable").appendChild(newRow);
}

function deleteOldTableEntries(){
  if(rowCounter > 0){
    while(rowCounter >= 0){
      var child = document.getElementById("row".concat(rowCounter));
      child.remove();
      rowCounter--;
    }
  }
}

function fillTable(){
  deleteOldTableEntries();
  addNewElementToTable("test name".concat(createdDataCounter), "test brief", "test url");
  createdDataCounter++;
  addNewElementToTable("test name".concat(createdDataCounter), "test brief", "test url");
  createdDataCounter++;
  addNewElementToTable("test name".concat(createdDataCounter), "test brief", "test url");
  createdDataCounter++;
  addNewElementToTable("test name".concat(createdDataCounter), "test brief", "test url");
  createdDataCounter++;
}

function checkBoxIsActivated(id){
  if(document.getElementById(id).value === "yes"){
    return 1;
  }
  return 0;
}

function searchButtonClicked(){
  var sources = new Array();
  if(checkBoxIsActivated("bitBucketCheckbox") === 1){
    sources.push("BitBucket");
  }
  if(checkBoxIsActivated("gitHubCheckbox") === 1){
    sources.push("GitHub");
  }
  if(checkBoxIsActivated("gitLabCheckBox") === 1){
    sources.push("GitLab");
  }
  alert(sources);
  var inputString = document.getElementById("input").value;
  document.getElementById("input").value = "";
  document.getElementById("lastSearchedOutput").innerHTML = inputString;
  searchForProjects(inputString, sources);
  fillTable();
}
