chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({url: "https://www.dropbox.com/home"});
});