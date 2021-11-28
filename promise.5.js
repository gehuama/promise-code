// all 方法

const MyPromise = require("./promise");
const fs = require('fs');

const readFile = (filePath) => {
  let dfd = MyPromise.deferred();
  fs.readFile(filePath, 'utf-8', function (err, data) {
    if (err) {// 失败了调用reject
      return dfd.reject(err);
    }
    dfd.resolve(data);
  })
  return dfd.promise;
}

// readFile('./a.txt').then(data => {
//   console.log(data)
// })

// readFile('./b.txt').then(data => {
//   console.log(data)
// })

// Promise.all 的特点 就是全成功才成功，有一个失败就失败 执行结果是有顺序的

MyPromise.all = function (promises) {
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

MyPromise.all([readFile('./a.txt'), readFile('./b.txt'),1, false]).then(data => {
  console.log(data)
}).catch(err => {
  console.log(err)
})