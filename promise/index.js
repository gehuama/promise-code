const PENDING = "PENDING"; // 等待
const FULFILLED = "FULFILLED"; // 成功
const REJECTED = "REJECTED"; // 失败
class Promise {
    constructor(executor) {
        this.value = undefined;
        this.reason = undefined;
        this.state = PENDING;
        const resolve = (value) => {
            if (this.state === PENDING) {
                this.value = value;
                this.state = FULFILLED;
            }

        }
        const reject = (reason) => {
            if (this.state === PENDING) {
                this.reason = reason;
                this.state = REJECTED;
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
    }
}

// 如果想把node中的文件给其他人使用
// 如下规范即可
module.exports = Promise;

// node默认不支持es6 需要通过babel转义
// node默认支持的就是common.js语法