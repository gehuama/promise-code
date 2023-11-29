
const MyPromise = require("./promise");

const promise1 = MyPromise.resolve(3);
const promise2 = new MyPromise((resolve, reject) =>
  setTimeout(reject, 100, 'foo'),
);
const promises = [promise1, promise2];

MyPromise.allSettled(promises).then((results) =>
  results.forEach((result) => console.log(result.status)),
);

MyPromise.allSettled([
  MyPromise.resolve(33),
  new MyPromise((resolve) => setTimeout(() => resolve(66), 0)),
  99,
  MyPromise.reject(new Error("an error")),
]).then((values) => console.log(values));