const PENDING = "PENDING"; // 等待
const FULFILLED = "FULFILLED"; // 成功
const REJECTED = "REJECTED"; // 失败
class Promise {
    constructor(executor) {
        this.value = undefined;
        this.reason = undefined;
        this.state = PENDING;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        const resolve = (value) => {
            if (this.state === PENDING) {
                this.value = value;
                this.state = FULFILLED;
                // 拿到所有成功回调
                this.onResolvedCallbacks.forEach(fn=>fn())
            }

        }
        const reject = (reason) => {
            if (this.state === PENDING) {
                this.reason = reason;
                this.state = REJECTED;
                // 拿到所有失败回调
                this.onRejectedCallbacks.forEach(fn=>fn())
            }
        }
        try {
            executor(resolve, reject)
        } catch (e) {
            // 如果执行时发生了异常就将异常作为失败的原因
            reject(e);
        }

    }
    then(onFulfilled, onRejected) { // Promise.prototype.then
        if (this.state === FULFILLED) {
            onFulfilled(this.value);
        }
        if (this.state === REJECTED) {
            onRejected(this.reason)
        }
        if(this.state === PENDING){
            // 这个时候用户没有调用 成功或者失败 没有resolve和reject
        
            this.onResolvedCallbacks.push(()=>{
                console.log("增加自定义的逻辑")
                onFulfilled(this.value)
            })
            this.onRejectedCallbacks.push(()=>{
                onRejected(this.reason);
            })
        }
    }
}

// 如果想把node中的文件给其他人使用
// 如下规范即可
module.exports = Promise;

// node默认不支持es6 需要通过babel转义
// node默认支持的就是common.js语法