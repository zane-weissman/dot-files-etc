/***************************************************************************************
 * Script appended on top of the Drive page on document_start (see preload.js)
 * to override the browser addEventListener() method to prevent Drive from attaching
 * keyboard capturing event handlers on the <html> node to allow us to intercept
 * shortcuts before Drive. We achieve this by attaching these Drive handlers to the
 * <body> instead and by registering our own capturing event handler on the <html> node
 ***************************************************************************************/

(function () {
    var nativeAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (eventName, eventHandler, useCapture) {
        var _target = this;
        var _eventHandler = eventHandler;
        if (useCapture && (eventName == 'keyup' || eventName == 'keydown' || eventName == 'keypress')
            && this.tagName && this.tagName.toLowerCase() == 'html') {
            var _body = document.querySelector('body');
            if (_body) {
                _target = _body;
                _eventHandler = function (e) {
                    // Execute Drive keyboard event handler if no AODocs dialog is opened and no input is focused
                    var openedAODialog = document.querySelector('dialog.ao-awd-dialog[open]');
                    if ((openedAODialog == null || openedAODialog.length == 0) &&
                        (!document.activeElement || document.activeElement.tagName.toLowerCase() != 'input')) {
                        eventHandler(e);
                    }
                };
            }
        }
        nativeAddEventListener.call(_target, eventName, _eventHandler, useCapture);
    };
})();
