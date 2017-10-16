
function goto_portal(){
	document.location = "https://" + localStorage['domain'] + ".edclub.com";
}

if(localStorage['domain'])
	goto_portal();
else
	document.location = "options.html";