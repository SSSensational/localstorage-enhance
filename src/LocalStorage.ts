import { debounce } from "lodash-es";
import LRUCache from "./LRUCache";

type Data = string | number | boolean | undefined | null | object;

interface DataObj {
  data: Data;
  time: number;
  maxAge: number;
}

class LocalStorageClass {
  private storageKey: string;
  private capacity: number;
  private encrypt: boolean;
  public memoryData: LRUCache<DataObj>;

  constructor({
    storageKey,
    capacity = 1000,
    encrypt = false,
  }: {
    storageKey: string;
    capacity?: number;
    encrypt?: boolean;
  }) {
    this.storageKey = storageKey ?? "localStorage_enhance";
    this.capacity = capacity;
    this.encrypt = encrypt;

    const storageData = globalThis.localStorage
      ? localStorage.getItem(this.storageKey)
      : null;
    this.memoryData = new LRUCache(this.capacity);
    if (!storageData) {
      this.syncMemoryToStorageIdle();
    } else {
      try {
        const storageDataArr: Array<[string, DataObj]> = JSON.parse(
          !this.encrypt ? storageData : atob(storageData)
        );
        this.generateMemoryDataFromArr(storageDataArr);
      } catch (err) {
        this.syncMemoryToStorageIdle();
      }
    }
    if (typeof window.addEventListener === "function") {
      window.addEventListener("beforeunload", () => this.syncMemoryToStorage());
    }
  }

  public setItem = ({
    key,
    data,
    maxAge = 0,
    namespace = "default",
  }: {
    key: string;
    data: Data;
    maxAge?: number;
    namespace?: string;
  }) => {
    this.memoryData.set(`${namespace}|${key}`, {
      data,
      time: Date.now(),
      maxAge,
    });
    this.syncMemoryToStorageIdle();
    return this;
  };

  public setMuilty = (
    dataObjs: Array<{
      key: string;
      data: Data;
      maxAge?: number;
      namespace?: string;
    }>
  ) => {
    dataObjs.forEach(({ key, data, maxAge = 0, namespace = "default" }) => {
      this.memoryData.set(`${namespace}|${key}`, {
        data,
        time: Date.now(),
        maxAge,
      });
    });
    this.syncMemoryToStorageIdle();
    return this;
  };

  public getItem = (key: string, namespace: string = "default") => {
    const targetItem = this.memoryData.get(`${namespace}|${key}`);
    if (!targetItem) return null;

    if (
      targetItem.maxAge > 0 &&
      Date.now() - targetItem.time > targetItem.maxAge
    ) {
      this.memoryData.delete(`${namespace}|${key}`);
      this.syncMemoryToStorageIdle();
      return null;
    }

    return targetItem.data;
  };

  public getMuilty = <T extends string>(
    keys: Array<T>,
    namespace: string = "default"
  ): { [K in T]: Data } => {
    const res = Object.create(null);
    let needSync = false;

    keys.forEach((key) => {
      const targetItem = this.memoryData.get(`${namespace}|${key}`);
      if (!targetItem) {
        res[key] = null;
        return;
      }

      if (
        targetItem.maxAge > 0 &&
        Date.now() - targetItem.time > targetItem.maxAge
      ) {
        this.memoryData.delete(`${namespace}|${key}`);
        res[key] = null;
        needSync = true;
      } else {
        res[key] = targetItem.data;
      }
    });

    if (needSync) {
      this.syncMemoryToStorageIdle();
    }

    return res;
  };

  public removeItem = (key: string, namespace: string = "default") => {
    const targetItem = this.memoryData.get(`${namespace}|${key}`);
    if (!targetItem) return null;

    this.memoryData.delete(`${namespace}|${key}`);
    this.syncMemoryToStorageIdle();
    return targetItem.data;
  };

  public removeMuilty = <T extends string>(
    keys: Array<T>,
    namespace: string = "default"
  ): { [K in T]: Data } => {
    const res = Object.create(null);
    let needSync = false;

    keys.forEach((key) => {
      const targetItem = this.memoryData.get(`${namespace}|${key}`);
      if (!targetItem) {
        res[key] = null;
        return;
      }

      this.memoryData.delete(`${namespace}|${key}`);
      needSync = true;
      res[key] = targetItem.data;
    });

    if (needSync) {
      this.syncMemoryToStorageIdle();
    }

    return res;
  };

  public clearNamespace = (namespace: string) => {
    const memoryDataArr = this.memoryData.toArr();
    const filteredArr = memoryDataArr.filter(
      ([key]) => key.indexOf(`${namespace}|`) === -1
    );
    this.generateMemoryDataFromArr(filteredArr);
    this.syncMemoryToStorageIdle();
    return this;
  };

  public clearAll = () => {
    this.memoryData = new LRUCache(this.capacity);
    this.syncMemoryToStorage();
    return this;
  };

  private generateMemoryDataFromArr = (arr: Array<[string, DataObj]>) => {
    this.memoryData = new LRUCache(this.capacity);
    for (let i = arr.length - 1; i >= 0; i--) {
      const [key, dataObj] = arr[i];
      this.memoryData.set(key, dataObj);
    }
  };

  private syncMemoryToStorage = (clearTime: number = 0) => {
    try {
      if (globalThis.localStorage) {
        localStorage.setItem(
          this.storageKey,
          this.encrypt
            ? btoa(JSON.stringify(this.memoryData.toArr()))
            : JSON.stringify(this.memoryData.toArr())
        );
      }
    } catch (err) {
      if (
        (err as any)?.name === "QuotaExceededError" ||
        (err as any)?.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        if (clearTime === 2) {
          console.error("syncMemoryToStorage error: ", err);
          console.error("You might storage big data.");
          return;
        }
        const memoryDataArr = this.memoryData.toArr();
        for (
          let i = memoryDataArr.length - 1;
          i >= memoryDataArr.length / 2;
          i--
        ) {
          const [key] = memoryDataArr[i];
          this.memoryData.delete(key);
        }
        this.syncMemoryToStorage(clearTime + 1);
      } else {
        console.error("syncMemoryToStorage error: ", err);
      }
    }
  };

  private syncMemoryToStorageIdle = debounce(() => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => this.syncMemoryToStorage());
    }
  }, 100);
}

export default LocalStorageClass;
