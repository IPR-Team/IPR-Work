//Useful link: Bitbucket API: https://developer.atlassian.com/bitbucket/api/2/reference/
//Noch ein paar Tipps:
//- Zuerst solltest du checken, ob es ein Limit für API Requests gibt. Meistens
// gibt es dann eine Ausweichadresse, wo du deinen Connector testen kannst, ohne
// dein Limit auf zu brauchen
//- Guck am Besten auch ob es schon von der API her einen Such-/Filteraögorithmus gibt
//- Pagination: Link Header!

function BitBucketAPIConnector(aSearchString, aCallback){
  var callback = aCallback; // ganz wichtig! callback(listOfProjects), damit auf mainHtml dargestellt wird
  var searchString = aSearchString;

  this.searchForProjects = function(amount_of_results, page){

  }
}

//weitere Anregungen kannst du dir aus dem GitHubAPIConnector holen.
