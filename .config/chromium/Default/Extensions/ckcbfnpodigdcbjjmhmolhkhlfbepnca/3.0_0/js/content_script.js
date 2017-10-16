$(document).ready(function() {
  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

  var url_id = getUrlVars()["id"];
  var url_category = getUrlVars()["category"];
  var url_mode = getUrlVars()["mode"];
  var url_type = getUrlVars()["type"];
  var url_token = getUrlVars()["token"];
  
  var form = document.createElement("form");
  form.setAttribute("method", "POST");
  if (window.location.href.split("/")[3] === "a") {
    form.setAttribute("action", "/a/myplanetdigital.com/usetemplate");
  } else {
    form.setAttribute("action", "/usetemplate");
  }

  var id = document.createElement("input");
  id.setAttribute("type", "hidden");
  id.setAttribute("name", "id");
  id.setAttribute("value", url_id);
  form.appendChild(id);

  var category = document.createElement("input");
  category.setAttribute("type", "hidden");
  category.setAttribute("name", "category");
  category.setAttribute("value", url_category);
  form.appendChild(category);

  var mode = document.createElement("input");
  mode.setAttribute("type", "hidden");
  mode.setAttribute("name", "mode");
  mode.setAttribute("value", url_mode);
  form.appendChild(mode);

  var type = document.createElement("input");
  type.setAttribute("type", "hidden");
  type.setAttribute("name", "type");
  type.setAttribute("value", url_type);
  form.appendChild(type);

  var token = document.createElement("input");
  token.setAttribute("type", "hidden");
  token.setAttribute("name", "token");
  token.setAttribute("value", url_token);
  form.appendChild(token);

  document.body.appendChild(form);
  form.submit();
});
