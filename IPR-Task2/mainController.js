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

function searchButtonClicked(){
  searchForProjects();
  fillTable();
}
