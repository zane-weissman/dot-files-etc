function pageOnClick(info, tab) {
	createNewTab(info.pageUrl);
}

function selectionOnClick(info, tab) {
	createNewTab(info.selectionText);
}

function linkOnClick(info, tab) {
	createNewTab(info.linkUrl);
}

function ivaOnClick(info, tab) {
	createNewTab(info.srcUrl);
}

function createNewTab(qrtext) {
	chrome.tabs.create({'url': 'http://www.qrutils.com/?source=extension&qrtext=' + encodeURIComponent(qrtext.replace(/(\r\n|\n|\r)/gm,'\\n'))}, function(tab) {});
}

function createMenu(title, context, functionname) {
	chrome.contextMenus.create({"title": title, "contexts":[context],"onclick": functionname});
}

createMenu('Create QR Code for current url','page',pageOnClick);
createMenu('Create QR Code from selected text','selection',selectionOnClick);
createMenu('Create QR Code for hyperlink','link',linkOnClick);
createMenu('Create QR Code for image url','image',ivaOnClick);
createMenu('Create QR Code for video url','video',ivaOnClick);
createMenu('Create QR Code for audio url','audio',ivaOnClick);