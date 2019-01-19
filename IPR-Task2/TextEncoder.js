/**
  Not all letters / characters of a text are allowed for different process.
  Sometime characters has a special context in greater context. This encoder
  provides methods for different encodings.
  @author H.Tanke
  @version 1.0
*/
function TextEncoder(){
  /**
    To insert a text part in a domain part of an url its recommended to encode this text.
    Otherwise forbidden characters with special function can create errors.
    Use this function to encode a text and replace characters with speiacl
    characters to obtain functionality.
    @param text text with should be encoded
  */
  this.EncodeUrl = function (text) {
    var match = text.search(/[\s\:/\?#\[\]\@\!\$\&'\(\)\*\,;=]/);
    while(match >= 0){
      var newSign = getUrlEncodedSign(text.charAt(match));
      text = text.substring(0, match) + newSign + text.substring(match + 1, text.length);
      match = text.search(/[\s\:/\?#\[\]\@\!\$\&'\(\)\*\,;=]/);
    }

    return text;
  }

  /**
    With this function a sign will be encoded to url encode standard
    in case the sign has a special meaning.
    @param sign a sign which should be encoded to url encode standard  
  */
  var getUrlEncodedSign = function (sign) {
    switch(sign){
      case " ":
        return "%20";
      case ":":
        return "%3A";
      case "/":
        return "%2F";
      case "?":
        return "%3F";
      case "#":
        return "%23";
      case "[":
        return "%5B";
      case "]":
        return "%5D";
      case "@":
        return "%40";
      case "!":
        return "%21";
      case "$":
        return "%24";
      case "&":
        return "%26";
      case "\'":
        return "%27";
      case "(":
        return "%28";
      case ")":
        return "%29";
      case "*":
        return "%2A";
      case ",":
        return "%2c";
      case ";":
        return "%3B";
      case "=":
        return "%3D";
    }
  }
}
