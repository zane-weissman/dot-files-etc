/**
 * https://github.com/borismus/oauth2-extensions
 */

/**
 * Constructor
 *
 * @param {String} adapterName  name of the adapter to use for this OAuth 2
 * @param {Object|String} config object containing clientId, clientSecret and
 * apiScope or the string OAuth2.FINISH for the finish flow
 */
var OAuth2 = function (adapterName, config) {
    this.adapterName = adapterName;
    var that = this;
    OAuth2.loadAdapter(adapterName, function () {
        that.adapter = OAuth2.adapters[adapterName];
        if (config == OAuth2.FINISH) {
            that.finishAuth();
        } else if (config) {
            that.updateLocalStorage();
            var data = that.get();
            data.clientId = config.client_id;
            data.clientSecret = config.client_secret;
            data.apiScope = config.api_scope;
            that.setSource(data);
        }
    });
};

/**
 * Pass instead of config to specify the finishing OAuth flow.
 */
OAuth2.FINISH = 'finish';

/**
 * OAuth 2.0 endpoint adapters known to the library
 */
OAuth2.adapters = {};
OAuth2.adapterReverse = localStorage.oauth2_adapterReverse &&
    JSON.parse(localStorage.oauth2_adapterReverse) || {};
// Update the persisted adapterReverse in localStorage.
if (localStorage.adapterReverse) {
    OAuth2.adapterReverse = JSON.parse(localStorage.adapterReverse);
    delete localStorage.adapterReverse;
}

/**
 * Consolidates the data stored in localStorage on the current adapter in to
 * a single JSON object.
 * The update should only ever happen once per adapter and will delete the old
 * obsolete entries in localStorage after copying their values.
 */
OAuth2.prototype.updateLocalStorage = function () {
    // Check if update is even required.
    if (this.getSource()) {
        return;
    }
    var data = {};
    var variables = [
        'accessToken', 'accessTokenDate', 'apiScope', 'clientId', 'clientSecret',
        'expiresIn', 'refreshToken'
    ];
    // Check if a variable has already been persisted and then copy them.
    var key;
    for (var i = 0; i < variables.length; i++) {
        key = this.adapterName + '_' + variables[i];
        if (localStorage.hasOwnProperty(key)) {
            data[variables[i]] = localStorage[key];
            delete localStorage[key];
        }
    }
    // Persist the new JSON object in localStorage.
    this.setSource(data);
};

/**
 * Opens up an authorization popup window. This starts the OAuth 2.0 flow.
 *
 * @param {Function} callback Method to call when the user finished auth.
 */
OAuth2.prototype.openAuthorizationCodePopup = function (email, callback) {
    // Store a reference to the callback so that the newly opened window can call
    // it later.
    window['oauth-callback'] = callback;
    if (email) {
        localStorage['oauth2_currentUser'] = email;
    }
    // Create a new tab with the OAuth 2.0 prompt
    // and give it the opener tab id to get back there
    var _this = this;
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var createProperties = {url: _this.adapter.authorizationCodeURL(_this.getConfig(email))};
        if (tabs[0]) {
            createProperties.openerTabId = tabs[0].id;
        }
        chrome.tabs.create(createProperties,
            function (tab) {
                // 1. user grants permission for the application to access the OAuth 2.0
                // endpoint
                // 2. the endpoint redirects to the redirect URL.
                // 3. the extension injects a script into that redirect URL
                // 4. the injected script redirects back to oauth2.html, also passing
                // the redirect URL
                // 5. oauth2.html uses redirect URL to know what OAuth 2.0 flow to finish
                // (if there are multiple OAuth 2.0 adapters)
                // 6. Finally, the flow is finished and client code can call
                // myAuth.getAccessToken() to get a valid access token.
            });
    });
};

/**
 * Gets access and
 (if provided by endpoint) tokens
 *
 * @param {String} authorizationCode Retrieved from the first step in the process
 * @param {Function} callback Called back with 3 params:
 *                            access token, refresh token and expiry time
 */
OAuth2.prototype.getAccessAndRefreshTokens = function (authorizationCode, callback) {
    var that = this;
    // Make an XHR to get the token
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function (event) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                // Callback with the data (incl. tokens).
                callback(that.adapter.parseAccessToken(xhr.responseText));
            }
        }
    });

    var method = that.adapter.accessTokenMethod();
    var items = that.adapter.accessTokenParams(authorizationCode, that.getConfig());
    if (method == 'POST') {
        xhr.open(method, that.adapter.accessTokenURL(), true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(that._encodeData(items));
    } else if (method == 'GET') {
        var url = that.adapter.accessTokenURL();
        var params = '?' + that._encodeData(items);
        xhr.open(method, url + params, true);
        xhr.send();
    } else {
        throw method + ' is an unknown method';
    }
};

/**
 * Refreshes the access token using the currently stored refresh token
 * Note: this only happens for the Google adapter since all other OAuth 2.0
 * endpoints don't implement refresh tokens.
 *
 * @param {String} refreshToken A valid refresh token
 * @param {String} email User email address
 * @param {Function} callback On success, called with access token and expiry time and refresh token
 * @param {Function} onInvalidToken
 * @param {Function} [onUnknownError]
 */
OAuth2.prototype.refreshAccessToken = function (refreshToken, email, callback, onInvalidToken, onUnknownError) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const status = xhr.status;
            const response = JSON.parse(xhr.responseText);
            if (status === 200) {
                callback(response.access_token, response.expires_in, refreshToken);
            } else if (status === 400) {
                onInvalidToken();
            } else if (onUnknownError) {
                onUnknownError(status, response);
            }
        }
    };

    const data = this.get(null, email);
    const params = {
        client_id: data.clientId,
        client_secret: data.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
    };
    xhr.open('POST', this.adapter.accessTokenURL(), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(this._encodeData(params));
};

/**
 * Extracts authorizationCode from the URL and makes a request to the last
 * leg of the OAuth 2.0 process.
 */
OAuth2.prototype.finishAuth = function () {
    var authorizationCode = null;
    var that = this;

    // Loop through existing extension views and excute any stored callbacks.
    function callback(error) {
        var views = chrome.extension.getViews();
        for (var i = 0, view; view = views[i]; i++) {
            if (view['oauth-callback']) {
                view['oauth-callback'](error);
                // TODO: Decide whether it's worth it to scope the callback or not.
                // Currently, every provider will share the same callback address but
                // that's not such a big deal assuming that they check to see whether
                // the token exists instead of blindly trusting that it does.
            }
        }

        // Once we get here, close the current tab and we're good to go.
        chrome.tabs.getCurrent(function (tab) {
            // Go back to previous tab
            if (tab.openerTabId != undefined) {
                chrome.tabs.update(tab.openerTabId, {active: true, highlighted: true});
            }
            // Close autorisations tab
            chrome.tabs.remove(tab.id);
        });
    }

    try {
        authorizationCode = that.adapter.parseAuthorizationCode(window.location.href);
        //console.log(authorizationCode);
    } catch (e) {
        console.error(e);
        callback(e);
    }

    that.getAccessAndRefreshTokens(authorizationCode, function (response) {
        var data = that.get();
        data.accessTokenDate = new Date().valueOf();

        // Set all data returned by the OAuth 2.0 provider.
        for (var name in response) {
            if (response.hasOwnProperty(name) && response[name]) {
                data[name] = response[name];
            }
        }
        that.setSource(data, localStorage['oauth2_currentUser']);
        callback();
    });
};

/**
 * @return {Boolean} true if the current access token has expired
 */
OAuth2.prototype.isAccessTokenExpired = function (email) {
    var data = this.get(null, email);
    var fifteenMinutesInSec = 60 * 15;
    var minRemainingSec = data.expiresIn > fifteenMinutesInSec ? fifteenMinutesInSec : 0;
    return (Date.now() - data.accessTokenDate) > ((data.expiresIn - minRemainingSec) * 1000);
};

/**
 * Get the persisted adapter data in localStorage. Optionally, provide a
 * property name to only retrieve its value.
 *
 * @param {String} [name] The name of the property to be retrieved.
 * @return {Object|String} The data object or property value if name was specified.
 */
OAuth2.prototype.get = function (name, email) {
    var src = this.getSource(email);
    var obj = src ? JSON.parse(src) : {};
    return name ? obj[name] : obj;
};

/**
 * Set the value of a named property on the persisted adapter data in
 * localStorage.
 *
 * @param {String} name The name of the property to change.
 * @param value The value to be set.
 */
OAuth2.prototype.set = function (name, value) {
    var obj = this.get();
    obj[name] = value;
    this.setSource(obj);
};

/**
 * Clear all persisted adapter data in localStorage. Optionally, provide a
 * property name to only clear its value.
 *
 * @param {String} [name] The name of the property to clear.
 */
OAuth2.prototype.clear = function (name, email) {
    if (name) {
        var obj = this.get(null, email);
        delete obj[name];
        this.setSource(obj, email);
    } else {
        delete localStorage['oauth2_' + this.adapterName + (email ? '_' + email : '')];
    }
};

/**
 * Get the JSON string for the object stored in localStorage.
 * @param {String} [email] optional user email address
 * @return {String} The source JSON string.
 */
OAuth2.prototype.getSource = function (email) {
    return localStorage['oauth2_' + this.adapterName + (email ? '_' + email : '')];
};

/**
 * Set the JSON string for the object stored in localStorage.
 *
 * @param {Object|String} source The new JSON string/object to be set.
 * @param {String} [email] user email
 */
OAuth2.prototype.setSource = function (source, email) {
    if (!source) {
        return;
    }
    if (typeof source !== 'string') {
        source = JSON.stringify(source);
    }
    localStorage['oauth2_' + this.adapterName + (email ? '_' + email : '')] = source;
};

/**
 * Get the configuration parameters to be passed to the adapter.
 *
 * @returns {Object} Contains clientId, clientSecret and apiScope.
 */


/**
 * Get the configuration parameters to be passed to the adapter.
 * @param {String} [email] user email address.
 * @returns {Object} Contains clientId, clientSecret and apiScope.
 */
OAuth2.prototype.getConfig = function (email) {
    var data = this.get();
    var config = {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        apiScope: data.apiScope
    };
    if (email) {
        config.email = email;
    }
    return config;
};

/**
 * Encode the given key/value data to be passed as request parameters
 * @param {Object} data - key/value js object
 * @return {String} encoded data as key1=value1&keyN=valueN
 * @private
 */
OAuth2.prototype._encodeData = function (data) {
    return Object.keys(data).map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join('=');
    }).join('&');
};

/***********************************
 *
 * STATIC ADAPTER RELATED METHODS
 *
 ***********************************/

/**
 * Loads an OAuth 2.0 adapter and calls back when it's loaded
 *
 * @param adapterName {String} The name of the JS file
 * @param callback {Function} Called as soon as the adapter has been loaded
 */
OAuth2.loadAdapter = function (adapterName, callback) {
    // If it's already loaded, don't load it again
    if (OAuth2.adapters[adapterName]) {
        callback();
        return;
    }
    var head = document.querySelector('head');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/vendor/oauth2/adapters/' + adapterName + '.js';
    script.addEventListener('load', function () {
        callback();
    });
    head.appendChild(script);
};

/**
 * Registers an adapter with the library. This call is used by each adapter
 *
 * @param {String} name The adapter name
 * @param {Object} impl The adapter implementation
 *
 * @throws {String} If the specified adapter is invalid
 */
OAuth2.adapter = function (name, impl) {
    var implementing = 'authorizationCodeURL redirectURL accessTokenURL ' +
        'accessTokenMethod accessTokenParams accessToken';

    // Check for missing methods
    implementing.split(' ').forEach(function (method, index) {
        if (!method in impl) {
            throw 'Invalid adapter! Missing method: ' + method;
        }
    });

    // Save the adapter in the adapter registry
    OAuth2.adapters[name] = impl;
    // Make an entry in the adapter lookup table
    OAuth2.adapterReverse[impl.redirectURL()] = name;
    // Store the the adapter lookup table in localStorage
    localStorage.oauth2_adapterReverse = JSON.stringify(OAuth2.adapterReverse);
};

/**
 * Looks up the adapter name based on the redirect URL. Used by oauth2.html
 * in the second part of the OAuth 2.0 flow.
 *
 * @param {String} url The url that called oauth2.html
 * @return The adapter for the current page
 */
OAuth2.lookupAdapterName = function (url) {
    var adapterReverse = JSON.parse(localStorage.oauth2_adapterReverse);
    return adapterReverse[url];
};

/***********************************
 *
 * PUBLIC API
 *
 ***********************************/

/**
 * Authorizes the OAuth authenticator instance.
 *
 * @param {String} email user email address
 * @param {Function} callback Tries to callback when auth is successful
 *                            Note: does not callback if grant popup required
 */
OAuth2.prototype.authorize = function (email, callback) {
    var that = this;
    OAuth2.loadAdapter(that.adapterName, function () {
        that.adapter = OAuth2.adapters[that.adapterName];
        var adapter = that.get();
        var data = that.get(null, email);
        if (!data) {
            that.openAuthorizationCodePopup(email, callback);
        } else if (data.clientId != adapter.clientId ||
            data.clientSecret != adapter.clientSecret || data.apiScope != adapter.apiScope) {
            // App clientId / clientSecret or apiScopes have changed.
            // Remove existing token and start the authorizationCode flow
            localStorage.removeItem('oauth2_' + that.adapterName + (email ? '_' + email : ''));
            that.openAuthorizationCodePopup(email, callback);
        } else if (!data.accessToken) {
            // There's no access token yet. Start the authorizationCode flow
            that.openAuthorizationCodePopup(email, callback);
        } else if (that.isAccessTokenExpired(email)) {
            // There's an existing access token but it's expired
            if (data.refreshToken) {
                that.refreshAccessToken(data.refreshToken, email, function (at, exp, re) {
                    var newData = that.get(null, email);
                    newData.accessTokenDate = new Date().valueOf();
                    newData.accessToken = at;
                    newData.expiresIn = exp;
                    newData.refreshToken = re;
                    that.setSource(newData, email);
                    // Callback when we finish refreshing
                    if (callback) {
                        callback(true);
                    }
                }, function () {
                    // Token has been revoked
                    console.log('Cannot refresh a revoked token, restart oauth flow');
                    that.openAuthorizationCodePopup(email, callback);
                });
            } else {
                // No refresh token... just do the popup thing again
                that.openAuthorizationCodePopup(email, callback);
            }
        } else {
            // We have an access token, and it's not expired yet
            if (callback) {
                callback(true);
            }
        }
    });
};

/**
 * @returns {String} A valid access token.
 */
OAuth2.prototype.getAccessToken = function (email) {
    return this.get('accessToken', email);
};

/**
 * Indicate whether or not a valid access token exists.
 * @returns {Boolean} true if an access token exists; otherwise false.
 */
OAuth2.prototype.hasAccessToken = function (email) {
    return !!this.get('accessToken', email);
};

/**
 * Clears an access token, effectively "logging out" of the service.
 */
OAuth2.prototype.clearAccessToken = function (email) {
    this.clear('accessToken', email);
};

/**
 * Clears an access token, effectively "logging out" of the service.
 */
OAuth2.prototype.clearTokenData = function (email) {
    var oauth2Data = this.get(null, email);
    delete oauth2Data.accessToken;
    delete oauth2Data.accessTokenDate;
    delete oauth2Data.refreshToken;
    delete oauth2Data.expiresIn;
    this.setSource(oauth2Data, email);
};
