import { AsyncStorage } from 'react-native';

export default class ReactNativeAsyncStorageBackend {
  constructor(fpath) {
    this.fpath = fpath;
  }

  read() {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('@fitness-app:' + this.fpath, (error, item) => {
        console.log('read from storage', item);
        return error || item === null
          ? reject(error)
          : resolve(JSON.parse(item));
      });
    });
  }

  write(obj) {
    return new Promise((resolve, reject) => {
      console.log('storing', obj);
      AsyncStorage.setItem(
        '@fitness-app:' + this.fpath,
        JSON.stringify(obj),
        error => error ? reject(error) : resolve(error),
      );
    });
  }
}
