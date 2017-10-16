/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.

  chrome.storage.local.get('domain', function(data){
    if(data.domain)
      goto_portal(data.domain);
    else
      show_options();
  });
});


function goto_portal(domain){
   window.open('https://' + domain + '.edclub.com');

  // chrome.app.window.create('portal.html', {
  //   id: "portal",
  //   bounds: {
  //     width: screen.availWidth,
  //     height: screen.availHeight,
  //     left: 0,
  //     top: 0
  //   },
  //   type:"shell"
  // });
}

function show_options(){
  chrome.app.window.create('options.html', {
    id: "options2",
    bounds: {
      width: screen.availWidth-200,
      height: screen.availHeight-200,
      left: 100,
      top: 100
    }
  });
}
