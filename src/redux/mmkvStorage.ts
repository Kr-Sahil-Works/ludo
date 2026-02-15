import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const mmkvStorage = {
  setItem: async (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: async (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: async (key: string) => {
    storage.delete(key);
  },
};
