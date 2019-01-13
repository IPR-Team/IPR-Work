function TextTranslator(){
  //text = array, targetLanguageKey: f.e. ru, de, en
  this.translateText = function (text, targetLanguageKey, callback){
    var url = "https://translate.yandex.net/api/v1.5/tr.json/translate";
    var key = "?key=trnsl.1.1.20190113T111827Z.f1625132c6454630.d83702b62ef89556bccf67d9c4df672d2b4a7275"
    var content = "";
    var lang = "&lang=".concat(targetLanguageKey)
    for(var i = 0; i < text.length; i++){
      content = content.concat("&text='", text[i], "'");
    }
    fetch(url)
    .then(function(response){
      if(response.ok){
        console.log("Requested: " + url);
        return response.json();
      }else{
        throw new Error("Translation query could not be executed! Maybe url string contains to many signs.");
      }
    })
    .then(function(jsonString){
      var contentParts = jsonString.text;
      console.log("Received " + jsonString.text + " translated content parts");
      var translatedContentParts = cleanContent(contentParts);
      callback(translatedContentParts);
    })
    .catch(function(error){
      console.log(error);
    });
  }

  var cleanContent = function(content){
    for(var i = 0; i < content.length; i++){
      content[i] = trimText(content[i]);
    }
    return content;
  }

  var trimText = function(text){
    while(text.substring(0,1).match("[\"\'\\]") != null){
      text = text.substring(1, text.length);
    }
    while(text.substring(text.length - 1, text.length).match("[\"\'\\]") != null){
      text = text.substring(0, text.length - 1);
    }
    return text;
  }
}
