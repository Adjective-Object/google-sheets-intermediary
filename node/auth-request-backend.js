const readline = require('readline');
module.exports = class NodeCliAuthBackend {

    getAuthUrl(clientSecret) {
        const baseAuthUrl = 'https://accounts.google.com/o/oauth2/auth'
        const authorizationUri = baseAuthUrl + '?' +
            querystring.stringify({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                response_type: 'code',
                client_id: clientSecret.client_id,
                redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
            })
        return authorizationUri;
    }

    auth(clientSecret) {
        return new Promise((resolve, reject) => {
            const tokenUrl = this.getAuthUrl(clientSecret);

            console.log('please paste the following url into a browser')
            console.log('paste the resulting access code here.')
            console.log()
            console.log(tokenUrl);
            console.log()

            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });

            rl.question('code?: ', (token) => {
                resolve(token);
                rl.close();
            });
        });
    }

}