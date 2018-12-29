function pullGitHubRepositories(searchString){
  const Http = new XMLHttpRequest();
  const url = "https://api.github.com/repositories?since=369";
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange=(e)=>{
    if(Http.readyState === 4 && Http.status === 200 ){
        alert(Http.responseText);
    }
  }
}
