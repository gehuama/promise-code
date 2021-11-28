const PENDING = "PENDING"; // 等待
const FULFILLED = "FULFILLED"; // 成功
const REJECTED = "REJECTED"; // 失败
// 在编写代码的时候 如果 typeof xxx.then === 'function' 就姑且认为他是promise了
// promiseA+ 规范帮我们将解决了 多个promise库可以兼容的问题
// 别人的库 可能既调用了成功 又调用了失败 2个都会执行
const resolvePromise = (x, promise2, resolve, reject) => {
  // 处理x 导致的promise2 是成功还是失败
  // 如果x是普通值 直接调用promise2 的 resolve
  // 如果x是一个promise 那么就采用x的状态。并且将结果继续调用promise2的resolve和reject的向下传递
  // console.log(x, promise2, resolve, reject)

  // https://promisesaplus.com/#the-promise-resolution-procedure
  // 如果promise和x引用同一个对象，则拒绝promise，原因为TypeError
  if (promise2 === x) {
    return reject(new TypeError('不能自己等待自己完成', '出错了'));
  }
  // 找到x 是不是一个promise
  // 如果x是一个对象 而且x 不等于 null;如果x是一个函数
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') { // 别人家的promise 可以是函数
    // 才有可能是一个promise
    let called
    try {
      let then = x.then; // 因为用户返回的可能有一个then属性，因此取值就报错了
      if (typeof then === 'function') {// 这里无法在细化了，有then说明就是promise了
        // 这里就是promise，获取promise成功的值或者失败的值
        // 把x作为this抛出去
        // 注意：这里不能用 x.then() x.then 如果then方法是通过defineProperty来定义的会再次调用get方法
        then.call(x, (y) => {
          if (called) return;
          called = true;
          // 不停的解析直到是一个普通值为止
          resolvePromise(y, promise2, resolve, reject);
        }, (r) => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else { // {a:1}
        resolve(x); // 直接用x作为成功的结果
      }
    } catch (e) {
      if (called) return;
      called = true;
      return reject(e);
    }
  } else {
    // 当x 不是一个对象或函数，x一定是一个普通值 那么就直接让这个promise 变成成功状态
    resolve(x);
  }
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
    // 可选参数的含义就是用户不给 就用默认的
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
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
              let x = onFulfilled(this.value)
              resolvePromise(x, promise2, resolve, reject)
            } catch (e) {
              reject(e);
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(x, promise2, resolve, reject)
            } catch (e) {
              reject(e);
            }
          }, 0)
        })
      }
    })
    return promise2;

  }
}

// 默认测试的时候会调用此方法 会检测这个方法返回的对象是否符合规范 这个对象上需要有promise实例 resolve和reject
Promise.deferred = function(){
  let dfd = {}
  dfd.promise = new Promise((resolve,reject)=>{
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}
// 安装检测promise用法插件
// npm install promises-aplus-tests =g
// 通过运行下面命令 进行检测
// promises-aplus-tests promise.3.js
// 如果想把node中的文件给其他人使用
// 如下规范即可
module.exports = Promise;

// node默认不支持es6 需要通过babel转义
// node默认支持的就是common.js语法