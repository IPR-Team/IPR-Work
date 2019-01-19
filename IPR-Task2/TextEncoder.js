function TextEncoder(){
  this.EncodeUrl = function (text) {
    var match = text.search(/[\s\:/\?#\[\]\@\!\$\&'\(\)\*\,;=]/);
    while(match >= 0){
      var newSign = getUrlEncodedSign(text.charAt(match));
      text = text.substring(0, match) + newSign + text.substring(match + 1, text.length);
      match = text.search(/[\s\:/\?#\[\]\@\!\$\&'\(\)\*\,;=]/);
    }

    return text;
  }

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
