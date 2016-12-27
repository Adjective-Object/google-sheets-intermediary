const readline = require('readline');
module.exports = class NodeCliAuthBackend {

    auth(tokenUrl) {
        return new Promise((resolve, reject) => {
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