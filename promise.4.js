// promise 还有其他的常见方法

// catch

const Promise = require("./promise");
const fs = require('fs');

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) return reject(err); // 失败了调用reject
      resolve(data) // 成功调用 resolve
    })
  })
};

let promise2 = readFile('./a1.txt').then(data => {
  return readFile(data);
})

promise2.then(data => {

}).then(data => {
  console.log('s2:', data)
}).catch(e => { // 没有第一个参数的then就是catch
  console.log("catch的实现结果:", e) // catch的实现
})

// promise的resolve方法遇到promise会对promise进行解析
// 将一个普通值转换成promise
Promise.resolve(123).then(data => {
  console.log("将一个普通值转换成promise结果:", data);
})

// resolve 中 放置一个 new Promise
Promise.resolve(new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('ok')
  }, 1000)
})).then(data => {
  console.log("resolve中放置一个new Promise（）结果：", data);
})
// reject 方法
Promise.reject(new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('ok')
  }, 1000)
})).then(data => {
  console.log(data);
}).catch(err => {
  console.log("reject 方法结果", err);
})

// 3. Promise.finally
// 我们有些流程，需要无论成功和失败都能执行(流程会需要一定的时间) finally = then

// Promise.prototype.finally = function(cb){
//   return this.then((y)=>{
//     return Promise.resolve(cb()).then(()=>y)
//   },(r)=>{
//     // 因为finally的promise执行出错，会导致不会知晓Promise.resolve的正常逻辑， 所以finally错误为结果
//     return Promise.resolve(cb()).then(()=> {throw r})
//   })
// }
Promise.resolve("ok").finally(() => { // finally 并不会影响最终的结果
  console.log("resolve 无论如何都执行");
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      // 成功情况不会执行
      resolve("inner ok")
    },1000)
  })
}).then((data) => {
  console.log("resolve 成功", data);
}, (err) => {
  console.log("resolve 失败", err);
})

Promise.reject("ok").finally(() => { // finally 并不会影响最终的结果
  console.log("reject 无论如何都执行");
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      //  失败情况会执行
      reject("inner ok")
    },1000)
  })
}).then((data) => {
  console.log("reject 成功", data);
}, (err) => {
  console.log("reject 失败", err);
})