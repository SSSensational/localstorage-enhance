import { describe, it, expect } from 'vitest'
import LRUCache from '../LRUCache';

describe.concurrent("LRUCache test", () => {
    it("should set & get correctly", async () => {
        const cache = new LRUCache(2);
        const test1 = [
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
        const res1: Array<any> = [];
        test1.forEach(item => {
            if (item.type === 'set') {
                cache.set(item.key, item.value);
            } else if (item.type === 'get') {
                res1.push(cache.get(item.key));
            }
        });
        expect(res1).toEqual([1, null, null, 3, 4]);
    });
});

