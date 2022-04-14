import { describe, it, expect, vi } from 'vitest'
import { LocalStorageClass } from '../index';

describe.concurrent("Basic get & set & remove", () => {
    it("single set & get & remove", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage1' });

        LocalStorage.setItem({ key: 'string', data: 'string' });
        const stringItem = LocalStorage.getItem('string');
        expect(stringItem).toEqual('string');
        LocalStorage.removeItem('string');
        const stringItemAfter = LocalStorage.getItem('string');
        expect(stringItemAfter).toEqual(null);

        LocalStorage.setItem({ key: 'number', data: 333333 });
        const numberItem = LocalStorage.getItem('number');
        expect(numberItem).toEqual(333333);

        LocalStorage.setItem({ key: 'boolean', data: true });
        const booleanItem = LocalStorage.getItem('boolean');
        expect(booleanItem).toEqual(true);

        LocalStorage.setItem({ key: 'null', data: null });
        const nullItem = LocalStorage.getItem('null');
        expect(nullItem).toEqual(null);

        LocalStorage.setItem({ key: 'undefined', data: undefined });
        const undefinedItem = LocalStorage.getItem('undefined');
        expect(undefinedItem).toEqual(undefined);

        LocalStorage.setItem({ key: 'object', data: { testObj: '123', test: { qwe: false, wer: 3 } } });
        const objectItem = LocalStorage.getItem('object');
        expect(objectItem).toEqual({ testObj: '123', test: { qwe: false, wer: 3 } });

        const unSettedItem = LocalStorage.getItem('unSettedItem');
        expect(unSettedItem).toEqual(null)
        LocalStorage.removeItem('unSettedItem');
    });

    it("muilty set & get & remove", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage2' });

        LocalStorage.setItem({ key: 'string', data: 'string' });
        LocalStorage.setMuilty([{ key: 'boolean', data: false }, { key: 'object', data: { test: 324} }]);

        const muiltyRes = LocalStorage.getMuilty(['string', 'boolean', 'object', 'unset']);
        expect(muiltyRes).toEqual({ string: 'string', boolean: false, object: { test: 324 }, unset: null });

        const objectItem = LocalStorage.getItem('object');
        expect(objectItem).toEqual({ test: 324 });

        const removeRes = LocalStorage.removeMuilty(['boolean', 'string', 'unset']);
        const muiltyResAfter = LocalStorage.getMuilty(['string', 'boolean']);
        expect(muiltyResAfter).toEqual({ string: null, boolean: null });
        expect(removeRes).toEqual({ boolean: false, string: 'string', unset: null });
    });
});


describe.concurrent("Enhance namespace & maxAge time & chain call & encrypt data", () => {
    it("support namespace", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage3' });

        LocalStorage.setItem({ key: 'string', data: 'string', namespace: 'some-namespace' });
        const stringItemFromDefaultNamespace = LocalStorage.getItem('string');
        expect(stringItemFromDefaultNamespace).toEqual(null);
        const stringItemFromSettedNamespace = LocalStorage.getItem('string', 'some-namespace');
        expect(stringItemFromSettedNamespace).toEqual('string');

        LocalStorage.setMuilty([{ key: 'number', data: 1234, namespace: 'some-namespace2' }, { key: 'undefined', data: undefined }]);
        const muiltyResNamespace = LocalStorage.getMuilty(['number', 'undefined'], 'some-namespace2');
        expect(muiltyResNamespace).toEqual({ number: 1234, undefined: null });
        const muiltyResDefault = LocalStorage.getMuilty(['number', 'undefined']);
        expect(muiltyResDefault).toEqual({ number: null, undefined: undefined });
    });

    it("support clearNamespace & clearAll", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage4' });

        LocalStorage.setItem({ key: 'string', data: 'string', namespace: 'some-namespace' });
        const stringItemBefore = LocalStorage.getItem('string', 'some-namespace');
        expect(stringItemBefore).toEqual('string');

        LocalStorage.clearNamespace('some-namespace');
        const stringItemAfter = LocalStorage.getItem('string', 'some-namespace');
        expect(stringItemAfter).toEqual(null);

        LocalStorage.setItem({ key: 'number', data: 333333 });
        LocalStorage.clearNamespace('some-namespace');
        const numberItemBefore = LocalStorage.getItem('number');
        expect(numberItemBefore).toEqual(333333);
        
        LocalStorage.clearAll();
        const numberItemAfter = LocalStorage.getItem('number');
        expect(numberItemAfter).toEqual(null);
    });

    it("support maxAge", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage5' });

        const nowDate = Date.now();
        vi.setSystemTime(nowDate - 2000);
        LocalStorage.setItem({ key: 'string', data: 'string', maxAge: 1000  });

        const stringItemBefore = LocalStorage.getItem('string');
        expect(stringItemBefore).toEqual('string');

        vi.setSystemTime(nowDate);
        const stringItemNow = LocalStorage.getItem('string');
        expect(stringItemNow).toEqual(null);

        vi.setSystemTime(nowDate - 2500);
        LocalStorage.setMuilty([{ key: 'number', data: 1234, maxAge: 5000 }, { key: 'undefined', data: undefined, maxAge: 2000 }]);
        const muiltyResBefore = LocalStorage.getMuilty(['number', 'undefined']);
        expect(muiltyResBefore).toEqual({ number: 1234, undefined: undefined })
        
        vi.setSystemTime(nowDate);
        const muiltyResNow = LocalStorage.getMuilty(['number', 'undefined']);
        expect(muiltyResNow).toEqual({ number: 1234, undefined: null });
    });

    it("support chain call", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage6' });

        LocalStorage
            .setItem({ key: 'string', data: 'string' })
            .setItem({ key: 'number', data: 333333 })
            .setMuilty([{ key: 'boolean', data: false }, { key: 'object', data: { test: 324} }]);

        const stringItem = LocalStorage.getItem('string');
        expect(stringItem).toEqual('string');
        const numberItem = LocalStorage.getItem('number');
        expect(numberItem).toEqual(333333);
        const muiltyRes = LocalStorage.getMuilty(['string', 'boolean', 'object']);
        expect(muiltyRes).toEqual({ string: 'string', boolean: false, object: { test: 324 } });
    });

    it("support encrypt data", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage7', encrypt: true });

        LocalStorage.setItem({ key: 'string', data: 'string' });
        const stringItem = LocalStorage.getItem('string');
        expect(stringItem).toEqual('string');
        LocalStorage.removeItem('string');
        const stringItemAfter = LocalStorage.getItem('string');
        expect(stringItemAfter).toEqual(null);
    });
});


describe.concurrent("LRU work correctly", () => {
    it("support LRU", async () => {
        const LocalStorage = new LocalStorageClass({ storageKey: 'storage8', capacity: 2 });

        const test = [
            { type: 'set', key: '1', value: 1 },
            { type: 'set', key: '2', value: 2 },
            { type: 'get', key: '1' },
            { type: 'set', key: '3', value: 3 },
            { type: 'get', key: '2' },
            { type: 'set', key: '4', value: 4 },
            { type: 'get', key: '1' },
            { type: 'get', key: '3' },
            { type: 'get', key: '4' },
            { type: 'set', key: '3', value: -3 },
        ]
        const res: Array<any> = [];
        test.forEach(item => {
            if (item.type === 'set') {
                LocalStorage.setItem({ key: item.key, data: item.value });
            } else if (item.type === 'get') {
                res.push(LocalStorage.getItem(item.key));
            }
        });
        expect(res).toEqual([1, null, null, 3, 4]);
    });
});