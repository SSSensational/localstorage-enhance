class LRUCache<T> {
    private capacity: number;
    private size: number = 0;
    public map: Map<string, LRUNode<T>>;
    private head: LRUNode<T> = new LRUNode('head');
    private tail: LRUNode<T> = new LRUNode('tail');

    constructor(capacity: number = 1000) {
        this.capacity = capacity;
        this.head.next = this.tail;
        this.tail.pre = this.head;
        this.map = new Map();
    }
    
    public toArr = () => {
        const arr: Array<[string, T]> = [];
        let cur: LRUNode<T> | null = this.head;
        while (cur) {
            if (cur.data) {
                arr.push([cur.key, cur.data]);
            }
            cur = cur.next;
        }
        return arr;
    }

    public set = (key: string, val: any) => {
        if (!this.map) return;
        let node = this.map.get(key);
        if (!node) {
            node = new LRUNode(key, val);
            this.map.set(key, node);
            this.size++;
        } else {
            node.data = val;
            if (this.head.next !== node) this._deleteFromLinkedList(node);
        }

        if (this.head.next !== node) this._moveToHead(node);

        if (this.size > this.capacity) {
            const lastNode = this.tail.pre!;
            this.tail.pre = lastNode.pre;
            lastNode.pre!.next = this.tail;
            this.map.delete(lastNode.key);
            this.size--;
        }
    }

    public get = (key: string) => {
        const cacheNode = this.map.get(key);
        if (!cacheNode) return null;
        if (this.head.next !== cacheNode) {
            this._deleteFromLinkedList(cacheNode);
            this._moveToHead(cacheNode);
        }
        return cacheNode.data
    }

    public delete = (key: string) => {
        const cacheNode = this.map.get(key);
        if (!cacheNode) return false;
        this._deleteFromLinkedList(cacheNode);
        this.map.delete(key);
        this.size--;
        return true;
    }

    private _deleteFromLinkedList = (node: LRUNode<T>) => {
        const preNode = node.pre;
        const nextNode = node.next;
        preNode!.next = nextNode;
        nextNode!.pre = preNode;
    }

    private _moveToHead = (node: LRUNode<T>) => {
        const secondNode = this.head.next;
        node.pre = this.head;
        node.next = secondNode;
        secondNode!.pre = node;
        this.head.next = node;
    }
}

class LRUNode<T extends any> {
    public key: any;
    public data?: T;
    public next: LRUNode<T> | null;
    public pre: LRUNode<T> | null;
    
    constructor(key: any, data?: T) {
        this.key = key;
        this.data = data;
        this.next = null;
        this.pre = null;
    }
}

export default LRUCache;
