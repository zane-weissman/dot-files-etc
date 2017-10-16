/*******************************************************
 * Content-script loaded on document_start
 * (before any DOM is constructed or any script is run)
 *******************************************************/

(function () {
    // Check that the script has been already inserted by another active version of the
    // extension as it is always injected at 'document_start' before active extension check is run
    if (document.querySelector('#aod-addEventListener-override') === null) {
        var s = document.createElement('script');
        s.src = chrome.extension.getURL('/module/embedded/addEventListenerOverride.js');
        s.id = 'aod-addEventListener-override';
        s.async = false;
        document.documentElement.appendChild(s);
    }
})();