$(document).ready(function() {
  for(var i=1 ; i<6 ; i++) {
    var domainNo = "domain" + i.toString();
    var domain = localStorage[domainNo];
    if (domain !== undefined && domain !== '') {
      $("#" + domainNo + " p strong a").html(domain);
      $("#" + domainNo + " p strong a").attr("href","https://drive.google.com/drive/u/" + domain);
      $("#" + domainNo + " .document a").attr("href","https://docs.google.com/document/u/" + domain + "/create");
      $("#" + domainNo + " .spreadsheet a").attr("href","https://docs.google.com/spreadsheets/u/" + domain + "/create");
      $("#" + domainNo + " .form a").attr("href","https://docs.google.com/forms/u/" + domain + "/create");
      $("#" + domainNo + " .presentation a").attr("href","https://docs.google.com/presentation/u/" + domain + "/create");
      $("#" + domainNo + " .drawing a").attr("href","https://docs.google.com/drawings/u/" + domain + "/create");
      $("#" + domainNo).show();
    }
  }

  for(var i=1 ; i<4 ; i++) {
    var name = "name" + i.toString();
    if (localStorage[name] !== undefined && localStorage[name] !== '') {
      var id = localStorage["id" + i.toString()];
      var category = localStorage["category" + i.toString()];
      var mode = localStorage["mode" + i.toString()];
      var type = localStorage["type" + i.toString()];
      var token = localStorage["token" + i.toString()];
      var templateDomain = localStorage["templateDomain" + i.toString()];
      var templateName = localStorage[name];
    
      if (domain !== 'undefined') {
        $("#" + name + " a").attr("href","https://drive.google.com/a/" + templateDomain + "/usetemplate?id=" + id + "&category=" + category + "&mode=" + mode + "&type=" + type + "&token=" + token);
      } else {
        $("#" + name + " a").attr("href","https://drive.google.com/usetemplate?id=" + id + "&category=" + category + "&mode=" + mode + "&type=" + type + "&token=" + token);
      }
      $("#" + name + " a").html(templateName);
      $("#customTemplates").show();
      $("#" + name).show();
    }
  }
});