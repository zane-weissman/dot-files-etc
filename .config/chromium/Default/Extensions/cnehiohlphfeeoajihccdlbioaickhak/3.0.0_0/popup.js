$(function() {
	$("#tabs").tabs();
	createqrurl();
	document.querySelector('#btnfree').addEventListener('click', createqrfree);
})

function createqrurl() {
	chrome.tabs.query( {'active': true, currentWindow: true}, function(tabArray) {
		createqr(tabArray[0].url, 'qrimage', '#qrlink');
	});
}

function createqrfree() {
	createqr(qrfreetext.value,'qrimage2','#qrlink2');
}

function createqr(text,idimage,idlink) {
	document.getElementById(idimage).innerHTML = '';
	if (text.length<100) {
		var typeno=10;
		var size=4;
	} else if (text.length<512) {
		var typeno=15;
		var size=4;	
	} else {
		var typeno=25;
		var size=3;		
	}
	try {
		var qr = qrcode(typeno, 'L');
		qr.addData(text);
		qr.make();
		document.getElementById(idimage).innerHTML = qr.createImgTag(size);
		var editbutton = '<p><form action="https://www.qrutils.com/" method="post"><input type="hidden" name="qrtext" value="' + text.replace(/(\r\n|\n|\r)/gm,'\\n') + '"><input type="hidden" name="source" value="extension"><input type="submit" value="Edit QR Code Image"></form>';
		var downloadlink = '<br />Click <a download="qr.png" href="' + document.getElementById(idimage).childNodes[0].src + '">here</a> to download the QR Code image.</p>';
		$(idlink).html(editbutton + downloadlink);
	} catch (e) {
		document.getElementById(idimage).innerHTML = '<p>The url is too long to generate a good QR Code (>1024 characters). Please use a URL shortner.</p>';
	}
}
