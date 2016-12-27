const fs = require('fs');

module.exports = class NodeFsStorageBackend {
    constructor(fpath) {
        this.fpath = fpath
    }

    read() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.fpath, (err, contentBuffer) => {
                if (err) {
                    return reject(err)
                }
                let content = contentBuffer.toString();
                try {
                    return resolve(JSON.parse(content))
                } catch (e) {
                    return reject(e)
                }
            })
        })
    }

    write(obj) {
        return new Promise((resolve, reject) => {
            console.log('writing', this.fpath, obj);
            console.log()
            fs.writeFile(this.fpath, JSON.stringify(obj), (err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    }



}