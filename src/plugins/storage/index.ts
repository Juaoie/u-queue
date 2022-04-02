import StorageAdapterAbstract from "./StorageAdapterAbstract";
import md5 from "js-md5";
import { encode, decode } from "js-base64";
import { isString, isObject } from "../../index";
/**
 * @name  sign.js
 * @description  数据传输加密
 * 依赖关系 js-md5 js-base64
 */

/**
 * signFun 导出加密函数
 * @param  {Object} 	obj
 * @param  {string} 	appkey
 * @return {string} 	返回加密字符串发送后端
 */
export function signFun(obj: Record<string, string>, appkey: string): string {
  if (!obj.ts) obj.ts = new Date().getTime().toString();
  const params = new URLSearchParams(obj);
  params.sort();
  const str = md5(params.toString() + appkey).toUpperCase();
  Object.assign(obj, { sn: str });
  return encode(JSON.stringify(obj));
}

/**
 * 缓存解码
 * @param key
 * @param type
 * @param storage
 * @returns
 */
const storageDecode = (name: string, type: StorageType, storage: string, key: string) => {
  const { value, ts } = JSON.parse(decode(storage));
  if (signFun({ value, ts }, key) === storage) return value;
  else {
    removeStorageSync(name, type);
    throw "服务器正遭受攻击，部分功能可能出现异常。给您带来不便，我们深表歉意！";
  }
};

/**
 * 同步获取缓存
 * @param key
 * @param type
 * @returns
 */
const getStorageSync = (name: string, type: StorageType, key?: string) => {
  if (type === StorageType.SESSION) {
    if (key) {
      const storage = sessionStorage.getItem(md5(name).toUpperCase());
      if (storage) return storageDecode(name, type, storage, key);
      else return null;
    } else {
      const storage = sessionStorage.getItem(name);
      if (storage) return storage;
      else return null;
    }
  } else if (type === StorageType.LOCAL) {
    if (key) {
      const storage = localStorage.getItem(md5(name).toUpperCase());
      if (storage) return storageDecode(name, type, storage, key);
      else return null;
    } else {
      const storage = localStorage.getItem(name);
      if (storage) return storage;
      else return null;
    }
  }
};
//TODO:通过封装类型来支持存储复杂数据类型
/**
 * 同步设置缓存
 * @param key
 * @param type
 * @param value
 */
const setStorageSync = (name: string, type: StorageType, value: string, key?: string) => {
  if (value === null || value === undefined) return removeStorageSync(name, type, key);
  if (type === StorageType.SESSION) {
    if (key) sessionStorage.setItem(md5(name).toUpperCase(), signFun({ value }, key));
    else sessionStorage.setItem(name, value);
  } else if (type === StorageType.LOCAL) {
    if (key) localStorage.setItem(md5(name).toUpperCase(), signFun({ value }, key));
    else localStorage.setItem(name, value);
  }
};
/**
 * 同步删除缓存
 * @param key
 * @param type
 */
const removeStorageSync = (name: string, type: StorageType, key: string) => {
  if (type === StorageType.SESSION) {
    if (key) sessionStorage.removeItem(md5(name).toUpperCase());
    else sessionStorage.removeItem(name);
  } else if (type === StorageType.LOCAL) {
    if (key) localStorage.removeItem(md5(name).toUpperCase());
    else localStorage.removeItem(name);
  }
};

export enum StorageType {
  SESSION = "session",
  LOCAL = "local",
}

type StorageOption =
  | (StorageType & { type?: StorageType; key?: string })
  | {
      type: StorageType;
      key?: string;
    };
type StorageConfig = {
  storageMemory?: StorageAdapterAbstract;
  key?: string;
};
type B<T> = {
  [k in keyof T]: any;
};
function getStorageType(storageOption: StorageOption): StorageType {
  if (isString(storageOption)) return storageOption;
  else if (isObject(storageOption)) return storageOption.type;
  else {
    console.log(`类型错误`);
  }
}
function getStorageKey(storageOption: StorageOption): string {
  if (isString(storageOption)) return null;
  else if (isObject(storageOption)) return storageOption.key;
  else {
    console.log(`类型错误`);
  }
}
export function createStoragePlugin<StorageData extends Record<string, StorageOption>>(
  storageData: StorageData,
  storageConfig?: StorageConfig
) {
  storageConfig = storageConfig || {};
  const __storage = {} as B<StorageData>;
  for (const key in storageData) {
    __storage[key] = null;
  }

  return {
    storage: __storage,
    init: () => {
      for (const name in storageData) {
        const type = getStorageType(storageData[name]);
        const key = getStorageKey(storageData[name]) || storageConfig.key;
        if (storageConfig.storageMemory) {
          storageConfig.storageMemory.setData(name, getStorageSync(name, type, key));
        }
        Object.defineProperty(__storage, name, {
          get() {
            if (storageConfig.storageMemory) {
              //从缓存中取
              return storageConfig.storageMemory.getData(name);
            } else {
              //直接取storage
              return getStorageSync(name, type, key);
            }
          },
          set(value: string) {
            setStorageSync(name, type, value, key);
            if (storageConfig.storageMemory) {
              storageConfig.storageMemory.setData(name, value);
            }
          },
        });
      }
    },
  };
}
