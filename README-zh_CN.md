localstorage-enhance
=========================

中文 | [English](https://github.com/SSSensational/localstorage-enhance)

* namespace 避免相同key覆盖
* maxAge 形式的过期时间
* LRU 淘汰
* 高性能（操作内存对象，闲时以 idleCallback + debounce 形式同步至 localStorage）

PS: 不要试图去做 **循环引用对象或者大量的数据** 这种违规操作。

## 引入

```bash
npm install --save localstorage-enhance
```

```javascript
import LocalStorage from 'localstorage-enhance';

// data 可以是以下类型
type Data = string | number | boolean | undefined | null | object;

LocalStorage.setItem({ key: 'demo', data: { test: 234 }});
const item = LocalStorage.getItem('demo'); // { test: 234 }
const unsettedItem = LocalStorage.getItem('unsetted'); // null

LocalStorage.removeItem('demo');
const item2 = LocalStorage.getItem('demo'); // null
```

## 使用

### namespace
```javascript
import LocalStorage from 'localstorage-enhance';

LocalStorage.setItem({ key: 'namespace-demo', value: 'in-default'});
LocalStorage.setItem({ key: 'namespace-demo', value: 'in-namespace', namespace: 'some-namespace' });

const item1 = LocalStorage.getItem('namespace-demo'); // 'in-default'
const item2 = LocalStorage.getItem('namespace-demo', 'some-namespace'); // 'in-namespace'
```


### maxAge
```javascript
import LocalStorage from 'localstorage-enhance';

LocalStorage.setItem({ key: 'maxAgeDemo', data: 'maxAge1000', maxAge: 1000  });

const item1 = LocalStorage.getItem('maxAgeDemo'); // 'maxAge1000'
setTimeout(() => {
    const item2 = LocalStorage.getItem('maxAgeDemo'); // null
}, 1500);
```

### LRU
如果想自定义 LRU 淘汰机制的容量，可以手动生成一个实例并指定 storageKey 和 capacity。

```javascript
import LocalStorage, { LocalStorageClass } from 'localstorage-enhance';
import  from 'localstorage-enhance';

// 默认的 LocalStorage = new LocalStorageClass({ storageKey: 'localStorage_enhance', capacity: 200, encrypt: false });
const MyLocalStorage = new LocalStorageClass({ storageKey: 'my_localStorage', capacity: 50 });
```

### 加密存储数据
手动生成一个实例，设置 encrypt 为true，会以 base64 的形式加密数据

```javascript
import { { LocalStorageClass } } from 'localstorage-enhance';
const MyLocalStorage = new LocalStorageClass({ storageKey: 'encrypt_localStorage', encrypt: true });
```

### 批量处理数据 

```javascript
    LocalStorage.setMuilty([{ key: 'string', data: 'string' }, { key: 'boolean', data: false }, { key: 'object', data: { test: 324} }]);

    const muiltyRes = LocalStorage.getMuilty(['string', 'boolean', 'object', 'unset']);
    // muiltyRes = { string: 'string', boolean: false, object: { test: 324 }, unset: null }

    // 链式调用
    LocalStorage
        .setItem({ key: '1', data: 1 })
        .setItem({ key: '2', data: 2 });
```


### 所有方法

```javascript
interface LocalStorage {
    setItem: ({ key, data, maxAge, namespace }: {
        key: string;
        data: Data;
        maxAge?: number | undefined;
        namespace?: string | undefined;
    }) => this;
    setMuilty: (dataObjs: Array<{
        key: string;
        data: Data;
        maxAge?: number;
        namespace?: string;
    }>) => this;
    getItem: (key: string, namespace?: string) => Data;
    getMuilty: <T extends string>(keys: T[], namespace?: string) => { [K in T]: Data; };
    removeItem: (key: string, namespace?: string) => Data;
    removeMuilty: <T extends string>(keys: T[], namespace?: string) => { [K in T]: Data; };
    clearNamespace: (namespace: string) => this;
    clearAll: () => this;
}
```

## 运行测试

Run the demos:
```bash
npm install
npm run test
```

## 打包

```bash
npm install
npm run build
```

## License

MIT
