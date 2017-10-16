OAuth2.adapter('google', {
  authorizationCodeURL: function(config) {
    // TODO: The new url is https://accounts.google.com/o/oauth2/v2/auth? (with 'v2')
    // but using it prevent the 'approval_prompt=force' to work, so when the token is
    // no more present in localStorage but a valid token exists, the tab is opened,
    // redirected, then closed without requiering the user to grant access (strange effect)
    return ('https://accounts.google.com/o/oauth2/auth?' +
      'approval_prompt=force&' +
      'client_id={{CLIENT_ID}}&' +
      'redirect_uri={{REDIRECT_URI}}&' +
      'scope={{API_SCOPE}}&' +
      'login_hint={{LOGIN_HINT}}&' +
      'access_type=offline&' +
      'response_type=code')
        .replace('{{CLIENT_ID}}', config.clientId)
        .replace('{{REDIRECT_URI}}', this.redirectURL(config))
        .replace('{{API_SCOPE}}', config.apiScope)
        .replace('{{LOGIN_HINT}}', config.email);
  },

  redirectURL: function(config) {
    return 'https://storage.googleapis.com/awesomedrive/AwesomeDriveLogo-120.png';
  },

  parseAuthorizationCode: function(url) {
    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
      throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  },

  accessTokenURL: function() {
    return 'https://www.googleapis.com/oauth2/v4/token';
  },

  accessTokenMethod: function() {
    return 'POST';
  },

  accessTokenParams: function(authorizationCode, config) {
    return {
      code: authorizationCode,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: this.redirectURL(config),
      grant_type: 'authorization_code'
    };
  },

  parseAccessToken: function(response) {
    var parsedResponse = JSON.parse(response);
    return {
      accessToken: parsedResponse.access_token,
      refreshToken: parsedResponse.refresh_token,
      expiresIn: parsedResponse.expires_in
    };
  }
});
