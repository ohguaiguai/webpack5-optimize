// 作用域提升

function a() {
  console.log(111, 'a');
  b();
  c();
}

function b() {
  console.log(111, 'b');
}

function c() {
  console.log(111, 'c');
}

// 最终会被编译为;
// function a() {
//   console.log(111, 'a');
//   console.log(111, 'b');
//   console.log(111, 'c');
// }
