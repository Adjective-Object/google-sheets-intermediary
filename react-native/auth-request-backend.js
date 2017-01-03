import {GoogleSignin} from 'react-native-google-signin';

export default class ReactNativeAuthBackend {

    auth(clientSecret) {
        return new Promise((resolve, reject) => {
            GoogleSignin.hasPlayServices({ autoResolve: true }).then(() => {
                // play services are available. can now configure library
                return GoogleSignin.configure({
                  scope: ['https://www.googleapis.com/auth/spreadsheets'],
                  webClientId: clientSecret.client_id,
                  offlineAccess: true
                })
            })
            .then(GoogleSignin.currentUserAsync)
            .then((user) => {
                if (user !== null) {
                    return reject(new Error('the user is already logged in?'))
                }
                return GoogleSignin.signIn()
            })
            .then(user => resolve(user.serverAuthCode))
            .catch((err) => {
              console.log("Play services error", err.code, err.message);
              reject(err);
            })

        });
    }

}