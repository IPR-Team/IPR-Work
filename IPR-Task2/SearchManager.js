function searchForProjects(){
  var inputString = document.getElementById("input").value;
  document.getElementById("input").value = "";
  document.getElementById("lastSearchedOutput").innerHTML = inputString;
}
