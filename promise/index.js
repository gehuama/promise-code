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
      // 这里不能用 value.then 方式 因为规范里有写，测试会通不过
      if (value instanceof Promise) {
        return value.then(resolve, reject); // 递归解析
      }
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
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  finally(cb) {
    return this.then((y) => {
      return Promise.resolve(cb()).then(() => y)
    }, (r) => {
      // 因为finally的promise执行出错，会导致不会知晓Promise.resolve的正常逻辑， 所以finally错误为结果
      return Promise.resolve(cb()).then(() => { throw r })
    })
  }
  static resolve(value) { // 我们希望有等待效果就用Promise.resolve
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }
  static reject(reason) { // Promise.reject 不具备等待效果
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
  static all(promises) {
    const arr = [];
    let times = 0; // 计数器就是解决异步并发问题
    return new Promise((resolve, reject) => {
      const processResult = (i, val) => {
        arr[i] = val;
        if (++times === promises.length) {
          resolve(arr);
        }
      }
      for (let i = 0; i < promises.length; i++) {
        let val = promises[i]; // 怎么让一个promise执行？ p.then
        if (typeof val.then === 'function') {
          val.then(val => processResult(i, val), reject);
        } else {
          processResult(i, val);
        }
      }
    })
  }
  /**
   * 所有的promise执行完成，返回对应结果，可能成功可能失败,以数组对象的格式返回[{status:'fulfilled',value: ''},{status:'rejected',reason: ''}]
   * @param {*} promises 
   * @returns {Promise} 返回一个promise
   * 2019年7月发布
   */
  static allSettled(promises) {
    const arr = [];
    let times = 0; // 计数器就是解决异步并发问题
    return new Promise((resolve, reject) => {
      // 无论成功还是失败都会调用
      const processResult = (i, val) => {
        arr[i] = val;
        if (++times === promises.length) {
          resolve(arr);
        }
      }

      for (let i = 0; i < promises.length; i++) {
        let val = promises[i];
        // 判断val是否是promise, 
        // 注意：用户在调用allSettled的时候可能传入的不是promise，因此通过判断val.then是不是一个函数，如果是函数就认为是promise
        if (typeof val.then === 'function') { // 当前是一个promise
          val.then(
            val => processResult(i, { status: 'fulfilled', value: val }), // 这里的val是成功的结果，因此需要将val放到value中，status为fulfilled
            r => processResult(i, { status: 'rejected', reason: r })); // 这里的r是失败的结果，因此需要将r放到reason中，status为rejected 与promise.all 不同的是，这里不会直接reject，而是将失败的结果放到数组中
        } else { // 当前不是一个promise
          processResult(i, { status: 'fulfilled', value: val }); // 这里的val是成功的结果，因此需要将val放到value中，status为fulfilled
        }
      }
    })
  }
  /** Promise数组中任意一个Promise成功就返回成功，否则所有失败返回失败结果 */
  static any(promises) {
    /**
     * @description: 获取AggregateError
     * @param {*} errors
     * @return {*}
     */
    const getAggregateError = (errors) => {
      if (typeof AggregateError === 'function') {
        /**
         * AggregateError 是一个新加入到 JavaScript 的内置对象，它是用来表示多个错误的错误集合。
         * 当你需要抛出多个错误时，你可以使用 AggregateError。
         * 它是 JavaScript ES2020 引入的新特性。
         */
        return new AggregateError(errors, 'All promises were rejected');
      }
      var error = new Error('All promises were rejected');
      error.name = 'AggregateError';
      error.errors = errors;
      return error;
    }

    return new Promise((resolve, reject) => {
      /** 是否有成功的Promise */
      let hasResolved = false;
      /** 定义失败原因数组 */
      const rejectionReasons = [];
      /** promise成功一次 */
      const resolveOnce = (value)=> {
        if (!hasResolved) {
          hasResolved = true;
          resolve(value);
        }
      }
      /**
      * @description: promise失败检查
      */
      const rejectionCheck = (reason) => {
        rejectionReasons.push(reason);
        // 所有promise都失败的情况，返回一个AggregateError，来提示失败原因
        if (rejectionReasons.length === promises.length) {
          reject(getAggregateError(rejectionReasons));
        }
      }
      for (let i = 0; i < promises.length; i++) {
        let val = promises[i];
        // 判断val是否是promise, 
        // 注意：用户在调用allSettled的时候可能传入的不是promise，因此通过判断val.then是不是一个函数，如果是函数就认为是promise
        if (typeof val.then === 'function') {
          // 执行promise 当promise执行成功时，直接返回当前成功promise
          // 当数组中的任意一个promise完成时,就会改变返回promise的状态,即使之后数组中其他promise也完成时,返回的promise也不再执行resolve或reject
          // val.then(resolveOnce, rejectionCheck);
          Promise.resolve(val).then(resolveOnce, rejectionCheck);
        } else {
          rejectionCheck()
        }
      }
    })
  }
}

// 默认测试的时候会调用此方法 会检测这个方法返回的对象是否符合规范 这个对象上需要有promise实例 resolve和reject
Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}
// 安装检测promise用法插件
// npm install promises-aplus-tests -g
// 通过运行下面命令 进行检测
// promises-aplus-tests promise.3.js
// 如果想把node中的文件给其他人使用
// 如下规范即可
module.exports = Promise;

// node默认不支持es6 需要通过babel转义
// node默认支持的就是common.js语法