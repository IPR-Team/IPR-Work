function pullBitBucketRepositories(searchString){
  const Http = new XMLHttpRequest();
  const url = "";
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange=(e)=>{
    if(Http.readyState===4 && Http.status === 200 ){
        alert(Http.responseText);
    }
  }
}