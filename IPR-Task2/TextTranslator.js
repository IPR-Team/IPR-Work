/**
  The TextTranslator manages text translation with help of Yandex.
  It requires a access token in order to perform a translation by API request.
  In order to create a access token a free registration on yandex website is required.
  @author H.Tanke, P. Mitzlaff
  @version 1.0
*/
function TextTranslator(token) {
  var privateToken = token;
  var encoder = new TextEncoder();

  /**
    Use this function to translate a text to a specific language
    @param text text for translation
    @param targetLanguageKey target language identifier
    @param id for matching result
    @param callback a function where result will be inserted
  */
  this.translateText = function(text, targetLanguageKey, id, callback) {
    var url = "https://translate.yandex.net/api/v1.5/tr.json/translate";
    var key = "?key=" + privateToken;
    var content = "";
    var content = "&text=";
    var lang = "&lang=".concat(targetLanguageKey)
    for (var i = 0; i < text.length; i++) {
      //content = content.concat("&text=", encoder.EncodeUrl(text[i]));
      content = content.concat(encoder.EncodeUrl(text[i]));
    }
    url = url.concat(key, content, lang);
    fetch(url)
      .then(function(response) {
        console.log("Requested: " + url);
        if (response.ok) {
          return response.json();
        } else {
          window.alert("Translation query could not be executed! Maybe your url string contains to many symbols.");
          console.log("Error during request: " + jsonString.message)
          callback(id, null);
        }
      })
      .then(function(jsonString) {
        var contentParts = jsonString.text;
        console.log(jsonString);
        console.log("Received translation.");
        callback(id, contentParts);
      })
      .catch(function(error) {
        window.alert("Unknown error during request!");
        console.log("Error: " + jsonString.message)
        callback(id, null);
      });
  }
}