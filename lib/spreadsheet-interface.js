let sheets = require('./sheets-api')
let querystring = require('querystring')

let RANGE_EXPENSES = 'Transactions!B5:E';
let RANGE_INCOME = 'Transactions!G5:J';

function unpackTransactList(googleTransactList) {
    let toRet = [];
    for(let t in googleTransactList) {
        toRet.push({
            date: googleTransactList[t][0],
            amount: googleTransactList[t][1],
            description: googleTransactList[t][2],
            category: googleTransactList[t][3],
        })
    }
    return toRet;
}

function packTransactList(localTransactList) {
    let toRet = [];
    for(let t in localTransactList) {
        toRet.push([
            localTransactList[t].date,
            localTransactList[t].amount,
            localTransactList[t].description,
            localTransactList[t].category,
        ]);
    }
    return toRet;
}

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
module.exports = class SpreadsheetBudget {

    // construct some stuff
    constructor(opts={}) {
        this.api = opts.api || null;
        this.timeout = null;

        if (!this.api) {
          throw new Error('SpreadsheetBudget missing some parameters');
        }
    }

    fetchState() {
        return this.api.batchGet({
            spreadsheetId: '17ocyXA_UjQ7rtGRa-EorjIVvaQhhZ0g11rv_r-hrKn0',
            ranges: [RANGE_EXPENSES, RANGE_INCOME]
        })
        .then((x) => {
          console.log(x);
          return x;
        })
        .then((res) => ({
            expenses: unpackTransactList(res.valueRanges[0].values),
            income: unpackTransactList(res.valueRanges[1].values)
        }));
    }

    pushState(state) {
        return this.api.batchUpdate({
          spreadsheetId: '17ocyXA_UjQ7rtGRa-EorjIVvaQhhZ0g11rv_r-hrKn0',
          valueInputOption: 'USER_ENTERED',
          data: [
              {
                  range: RANGE_EXPENSES,
                  majorDimension: 'ROWS',
                  values: packTransactList(state.expenses)
              },
              {
                  range: RANGE_INCOME,
                  majorDimension: 'ROWS',
                  values: packTransactList(state.income)
              }
          ],
        });
    }
}
