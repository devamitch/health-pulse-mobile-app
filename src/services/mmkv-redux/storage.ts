import { MMKV } from "react-native-mmkv";
import { Storage } from "redux-persist";

export const storage = new MMKV({
  id: 'synapsys',
  encryptionKey: 'vsagfgnkbikbFkjjbkbiFFhblkbibI26165G4AS6DGA'
});

export const reduxStorage: Storage = {
    setItem: async (key, value) => {
        storage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: (key) => {
        const value = storage.getString(key);
        return Promise.resolve(value);
    },
    removeItem: (key) => {
        storage.delete(key);
        return Promise.resolve();
    }
}