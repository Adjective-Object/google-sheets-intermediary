const querystring = require('./querystring');

module.exports = class AuthAccessManager {
  constructor(opts) {
    this.clientSecret = opts.clientSecret || null;
    this.authBackend = opts.authBackend || null;
    this.accessRequest = opts.accessRequest || null;
    this.storageBackend = opts.storageBackend || null;
    this.accessRefreshTimeout = null;
    this.accessToken = null;
    this.refreshToken = null;

    if (null === this.clientSecret)
      throw new Error('AuthAccessManager missing required clientSecret');
    if (null === this.authBackend)
      throw new Error('AuthAccessManager missing required authBackend');
    if (null === this.accessRequest)
      throw new Error('AuthAccessManager missing required accessRequest');
    if (null === this.storageBackend)
      throw new Error('AuthAccessManager missing required storageBackend');
  }

  auth() {
    // request the auth token and save it in the storage backend
    const authWithGoogle = () =>
      this.authBackend
        .auth(this.clientSecret)
        .then(
          authCode => this.accessRequest.exchange(this.clientSecret, authCode),
        )
        .then(this.__store.bind(this))
        .then(this.__scheduleRefresh.bind(this));

    const read = this.storageBackend
      .read()
      .catch(() => null)
      .then(state => {
        if (state == null) {
          // if the read fails (there is no stored state), re-auth
          return authWithGoogle();
        } else {
          console.log(`read state ${JSON.stringify(state, 0, 2)}`);

          this.accessToken = state.access_token;
          this.refreshToken = state.refresh_token;

          // on reading a bad state, re-auth
          if (!this.refreshToken || !this.accessToken) {
            console.log(`read bad state, re-authenticating`);
            return authWithGoogle();
          }

          // on reading an old state, re-auth
          if (state.expires_at < new Date().getTime() + 500) {
            console.log('refreshing token loaded from state');
            return this.__refreshAccessToken(state.refresh_token);
          }
        }
      });

    return read;
  }

  // use the backend to refresh access and store on disk,
  // update the timeout for the refresh token
  __refreshAccessToken(refreshToken) {
    return this.accessRequest
      .refresh(this.clientSecret, refreshToken)
      .then(this.__store.bind(this))
      .then(this.__scheduleRefresh.bind(this));
  }

  __store(res) {
    // res an object of form
    // {
    //     refresh_token,
    //     access_token,
    //     expires_in,
    // }
    console.log('saving state from', res);

    this.accessToken = res.access_token || this.accessToken;
    this.refreshToken = res.refresh_token || this.refreshToken;

    // store to disk for getting new tokens in the future
    let toStore = {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expires_at: new Date().getTime() + res.expires_in,
    };

    return this.storageBackend.write(toStore).then(() => res);
  }

  __scheduleRefresh(res) {
    // disable pending timeout
    console.log('scheduling refresh');

    if (this.accessTokenRefreshTimeout !== null) {
      clearTimeout(this.accessTokenRefreshTimeout);
    }

    // in half the expiration time, try to refresh the access token
    this.accessTokenRefreshTimeout = setTimeout(
      () => this.__refreshAccessToken.bind(this, res.refreshToken),
      res.expires_in / 2,
    );

    return res;
  }

  getAccessToken() {
    return this.accessToken;
  }
};
