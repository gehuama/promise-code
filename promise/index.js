const PENDING = "PENDING"; // 等待
const FULFILLED = "FULFILLED"; // 成功
const REJECTED = "REJECTED"; // 失败
const resolvePromise = (x, promise2, resolve, reject) => {
  // 处理x 导致的promise2 是成功还是失败
  // 如果x是普通值 直接调用promise2 的 resolve
  // 如果x是一个promise 那么就采用x的状态。并且将结果继续调用promise2的resolve和reject的向下传递
  console.log(x, promise2, resolve, reject)
}
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
        this.onResolvedCallbacks.forEach(fn => fn())
      }

    }
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.reason = reason;
        this.state = REJECTED;
        // 拿到所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn())
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
    let promise2 = new Promise((resolve, reject) => {
      // 链式调用的核心 就是处理x和promise2之间的关系
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(x, promise2, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(x, promise2, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === PENDING) {
        // 这个时候用户没有调用 成功或者失败 没有resolve和reject

        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              console.log("增加自定义的逻辑")
              let x = onFulfilled(this.value)
              resolvePromise(x, promise2, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(x, promise2, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2;

  }
}

// 如果想把node中的文件给其他人使用
// 如下规范即可
module.exports = Promise;

// node默认不支持es6 需要通过babel转义
// node默认支持的就是common.js语法