import {AsyncStorage} from 'react-native';

export default class ReactNativeAsyncStorageBackend {
    constructor(fpath) {
        this.fpath = fpath
    }

    read() {
        return AsyncStorage.getItem(this.fpath);
    }

    write(obj) {
        return AsyncStorage.getItem(
            this.fpath,
            JSON.stringify(obj)
        );
    }

}