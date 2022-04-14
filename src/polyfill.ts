(function() {
    if (!globalThis || (globalThis as any).requestIdleCallback) return;
    
    let deadlineTime: number;
    let callback: Function;
    
    let channel = new MessageChannel();
    let port1 = channel.port1;
    let port2 = channel.port2;
    
    port2.onmessage = () => {
        const timeRemaining = () => deadlineTime - performance.now();
        if (timeRemaining() > 1 && callback) {
            const deadline = { timeRemaining, didTimeout: false };
            callback(deadline);
        }
    }
    
    (globalThis as any).requestIdleCallback = function(cb: Function) {
        requestAnimationFrame(rafStartTime => {
            deadlineTime = rafStartTime + 16
            callback = cb
            port1.postMessage(null);
        });
    }
}());
