let fetch = require('node-fetch');
let querystring = require('querystring');

class ApiAccessError extends Error {
    constructor(url, options, message) {
        super("error in accessing " + url + "\n" +
                "options: " + JSON.stringify(options, null, 2) + "\n" +
                "response: " + message);
    }
}

module.exports = class SheetsApi {

    constructor(opts) {
        this.accessManager = opts.accessManager || null;
        if (!this.accessManager) {
            throw new Error('access manager not set');
        }
    }

    setAccessToken(token) {
        this.accessToken = token
    }

    __makeHeaders(token) {
        return {
            'Authorization': 'Bearer ' + 
                this.accessManager.getAccessToken()
        }
    }

    __request(url, fetchOpts, opts) {
        let query = '';
        let options = {
            headers: this.__makeHeaders(),
        };

        if (fetchOpts.method == 'POST') {
            options.headers['Content-Type'] = 'application/json'
            options.body = JSON.stringify(opts)
        } else {
            query = '?' + querystring.stringify(opts)
        }

        Object.assign(options, fetchOpts);

        console.log(options)

        let responseStatus = null;
        return fetch(url +  query, options)
            .then((response) => {
                responseStatus = response.status;
                return response.text();
            }).then((text) => {
                if (responseStatus !== 200) {
                    throw new ApiAccessError(url, opts, text);
                }
                return JSON.parse(text);
            });
    }

    __spreadsheetAction(method, action, opts) {
        return this.__request(
            'https://sheets.googleapis.com/v4/spreadsheets/' +
                opts.spreadsheetId + action,
            {method: method},
            opts
        );
    }

    batchUpdate(opts) {
        return this.__spreadsheetAction('POST', '/values:batchUpdate', opts)
    }

    batchGet(opts) {
        return this.__spreadsheetAction('GET', '/values:batchGet', opts)
    }

}