
$(function(){
	chrome.storage.local.get('domain', function(data){
		var domain = data.domain;
		$(document.body).html('<webview id="webview" src="https://' + domain + '.edclub.com" style="width:100%; height:100%"></webview>');
	});
});