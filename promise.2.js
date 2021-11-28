const Promise = require("./promise");
const fs = require('fs');
// 回调需要每个都处理错误，处理需要嵌套处理
// fs.readFile('./a.txt','utf-8',function(err,data){
//     if(err) return
//     fs.readFile(data, 'utf-8',function(err,data) {
//         if(err) return
//         console.log(data)
//     })
// })

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    resolve(100)
    // fs.readFile(filePath, 'utf8', function (err, data) {
    //     if (err) return reject(err); // 失败了调用reject
    //     resolve(data) // 成功调用 resolve
    // })
  })
};
// 将promise 嵌套进行简化
// 1. 如果promise中的then的回调(成功或者失败)返回一个普通值（不是promise， 也不是错误）会将结果传递到下一次then的成功回调中
// 2. 如果发生了异常，那么会把这个异常抛出道外层then的失败回调中去
// 3. 如果繁华的是一个promise 那么需要判断这个promise的状态。如果promise是成功 就继续将成功的结果传递到外层的成功，如果失败就将promise传递给外层的失败
// 只有抛出异常，或者返回一个失败的promise才会走失败 其他的都是成功
let promise2 = readFile('./a.txt').then(data => {
  return 199;
  // throw new Error("错误");
})
promise2.then((data) => {
  console.log(32, data);
}, (err) => {
  console.log(err);
})

// promise为什么能.then .then .then()  返回的并不是this ？
// 一个promise一旦成功了就不能失败，如果不停的返回this，状态就没发扭转了