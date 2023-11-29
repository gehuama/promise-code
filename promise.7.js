const MyPromise = require("./promise");
const promise1 = MyPromise.reject(0);
const promise2 = new MyPromise((resolve) => setTimeout(resolve, 100, '快速'));
const promise3 = new MyPromise((resolve) => setTimeout(resolve, 500, '缓慢'));

const promises = [promise1, promise2, promise3];

MyPromise.any(promises).then((value) => console.log(value));


const pErr = new MyPromise((resolve, reject) => {
  reject("一直失败");
});

const pSlow = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, "500毫秒完成");
});

const pFast = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, "100毫秒完成");
});

MyPromise.any([pErr, pSlow, pFast])
  .then((value) => {
    console.log(value);
  })
  .catch((error) => {
    console.log(error);
  })

const pErr1 = new MyPromise((resolve, reject) => {
  reject("一直失败");
});
const pSlowErr = new MyPromise((resolve, reject) => {
  setTimeout(reject, 500, "500毫秒失败");
});

const pFastErr = new MyPromise((resolve, reject) => {
  setTimeout(reject, 100, "100毫秒失败");
});

MyPromise.any([pErr1, pSlowErr, pFastErr])
.then((value) => {
    console.log(value);
})
.catch((error) => {
    console.log("失败", error);
})