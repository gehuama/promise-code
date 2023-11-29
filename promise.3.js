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
// let promise2 = readFile('./a.txt').then(data => {
//   return readFile(data);
// })
// promise2.then((data) => {
//   console.log(32, data);
// }, (err) => {
//   console.log(err);
// })

/** 1. promise为什么能.then .then .then()  返回的并不是this ？
 * 一个promise一旦成功了就不能失败，如果不停的返回this，状态就没发扭转了
 */

/**
 * 2.  x=== promise2 typeError 
 */
// let p = new Promise((resolve, reject)=>{
//   resolve();
// })
// let promise2 = p.then(data=>{
//   return obj; // 我们在这里会调用promise2 的resolve reject 吗？
// })

// promise2.then(()=>{
//   console.log("成功")
// },(e)=>{
//   console.log("失败", e);
// })
// let obj = {};
// Object.defineProperties(obj,'then',{
//   get(){
//     throw new Error();
//   }
// })
/**
 * 3. 如果取then的时候出错了就抛出异常，因为编程器人员自定义的对象上可能有then属性
 */


/**
 * 4. then方法中的回调可以忽略， 如果不是函数就会透传给下一个then
 */

// new Promise((resolve, reject)=>{
//   resolve(1000);
// }).then(null,null).then().then((data)=>{
//   console.log(data);
// })

new Promise((resolve, reject)=>{
  resolve(1000);
}).then(function(data){
  return data;
}).then(function(data){
  return data;
}).then(function(data){
  console.log(data);
})

new Promise((resolve, reject)=>{
  reject(1000);
}).then(null, function(err){
  throw err;
}).then(null,function(err){
  throw err;
}).then(null,function(err){
  console.log(err);
})