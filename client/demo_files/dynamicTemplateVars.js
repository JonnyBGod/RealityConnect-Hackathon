//window.onready = function () {

    var require;


    var requestURL = document.getElementById("dynamicTemplateVars").getAttribute("src");
    var queryString = requestURL.substring(requestURL.indexOf("?") + 1, requestURL.length);
    var params = queryString.split("&");

    for (var i = 0; i < params.length; i++) {
        var name = params[i].substring(0, params[i].indexOf("="));
        var value = params[i].substring(params[i].indexOf("=") + 1, params[i].length);

        if (isNaN(parseInt(value))) {
            params[i] = params[i].replace(value, "'" + value + "'");
        }

        // Finally, use eval to set values of pre-defined variables:
        eval(params[i]);
    }
    var require = JSON.parse(require);


    window.require = require;
//};
