const querystring = require('./querystring');

class AuthorizationCodeExchangeError extends Error {
  constructor(response) {
    super('error in exchanging auth code for access code');
    this.response = response;
  }
}

class AccessCodeRefreshError extends Error {
  constructor(response) {
    super('error in refreshing access code');
    this.response = response;
  }
}

module.exports = class AccessTokenManager {
  constructor(opts) {
    this.fetch = opts.fetch || null;

    if (!this.fetch) {
      throw new Error(
        'AccessTokenManager constructed w/o required argument fetch',
      );
    }
  }

  exchange(clientSecret, authorization_code) {
    const url = 'https://www.googleapis.com/oauth2/v4/token?' +
      querystring.stringify({
        code: authorization_code,
        client_id: clientSecret.client_id,
        client_secret: clientSecret.client_secret,
        grant_type: 'authorization_code',
        redirect_uri: clientSecret.redirect_uris[0],
        prompt: 'consent',
        access_type: 'offline',
        approval_prompt: 'force',
      });
    return this
      .fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then(result => {
        if (result.status !== 200) {
          throw new AuthorizationCodeExchangeError(result);
        }
        return result.text();
      })
      .then(text => {
        // TODO check the structure of the response
        console.log('exchanged one time code:', text);
        return JSON.parse(text);
      });
  }

  refresh(clientSecret, refresh_token) {
    const url = 'https://www.googleapis.com/oauth2/v4/token?' +
      querystring.stringify({
        refresh_token: refresh_token,
        client_id: clientSecret.client_id,
        client_secret: clientSecret.client_secret,
        grant_type: 'refresh_token',
        scope: '',
        redirect_uri: clientSecret.redirect_uris[0],
      });
    console.log(url);
    return this
      .fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then(result => {
        if (result.status !== 200) {
          throw new AccessCodeRefreshError(result);
        }
        return result.text();
      })
      .catch(
        err => err.response.text().then(text => {
          console.error(text);
          throw err;
        }),
      )
      .then(text => {
        console.log('refreshed token', text);
        // TODO handle failure
        // console.log(result)
        // TOOD extract auth
        return JSON.parse(text);
      });
  }
};
