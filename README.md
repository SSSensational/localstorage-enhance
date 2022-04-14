localstorage-enhance
=========================

English | [中文](https://github.com/SSSensational/localstorage-enhance/blob/main/README-zh_CN.md)

* 'namespace' to avoid same key override
* 'maxAge' set the data expiration time
* LRU obsolescence mechanism
* High performance (manipulate in-memory object, synchronize to localStorage as idleCallback + debounce)

PS: Do not do **loop reference object or a large amount of data** this violation.

## Install

```bash
npm install --save localstorage-enhance
```

```javascript
import LocalStorage from 'localstorage-enhance';

// data can be of the following types
type Data = string | number | boolean | undefined | null | object;

LocalStorage.setItem({ key: 'demo', data: { test: 234 }});
const item = LocalStorage.getItem('demo'); // { test: 234 }
const unsettedItem = LocalStorage.getItem('unsetted'); // null

LocalStorage.removeItem('demo');
const item2 = LocalStorage.getItem('demo'); // null
```

## Usage

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
If you want to customize the capacity of the LRU elimination mechanism, you can manually generate an instance and specify the storageKey and capacity.

```javascript
import LocalStorage, { LocalStorageClass } from 'localstorage-enhance';
import  from 'localstorage-enhance';

// default LocalStorage instance
// LocalStorage = new LocalStorageClass({ storageKey: 'localStorage_enhance', capacity: 200, encrypt: false });

const MyLocalStorage = new LocalStorageClass({ storageKey: 'my_localStorage', capacity: 50 });
```

### Encrypted storage data
Manually generate an instance, set encrypt to true and it will encrypt the data in base64

```javascript
import { { LocalStorageClass } } from 'localstorage-enhance';
const MyLocalStorage = new LocalStorageClass({ storageKey: 'encrypt_localStorage', encrypt: true });
```

### Batch processing of data 

```javascript
    LocalStorage.setMuilty([{ key: 'string', data: 'string' }, { key: 'boolean', data: false }, { key: 'object', data: { test: 324} }]);

    const muiltyRes = LocalStorage.getMuilty(['string', 'boolean', 'object', 'unset']);
    // muiltyRes = { string: 'string', boolean: false, object: { test: 324 }, unset: null }

    // Chain call
    LocalStorage
        .setItem({ key: '1', data: 1 })
        .setItem({ key: '2', data: 2 });
```


### All methods

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

## Run test

Run the demos:
```bash
npm install
npm run test
```

## Run build

```bash
npm install
npm run build
```

## License

MIT
