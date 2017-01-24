// import {GoogleSignin} from 'react-native-google-signin';

export default class ReactNativeAuthBackend {
  constructor(GoogleSignin) {
    // this is a hack to deal with react-native-packager
    this.googleSignin = GoogleSignin;
  }

  auth(clientSecret) {
    const GoogleSignin = this.googleSignin;
    console.log(GoogleSignin);
    return new Promise((resolve, reject) => {
      GoogleSignin
        .hasPlayServices({ autoResolve: true })
        .then(
          () => // play services are available. can now configure library
          GoogleSignin.configure({
            scopes: [ 'https://www.googleapis.com/auth/spreadsheets' ],
            webClientId: clientSecret.client_id,
            offlineAccess: true,
          }),
        )
        .then(GoogleSignin.currentUserAsync.bind(GoogleSignin))
        .then(user => {
          if (user !== null) {}
          return GoogleSignin.signIn();
        })
        .then(user => resolve(user.serverAuthCode))
        .catch(err => {
          console.log('Play services error', err.code, err.message);
          reject(err);
        });
    });
  }
}
