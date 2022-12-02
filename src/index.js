// import './index.css';

// import title from './title';
// console.log(111, 'title', title);

// import '../icon.png';
// let $ = require('jquery'); // jquery 就是 window.jQuery ，来自 CDN 引入
// console.log(111, '$', $);
// import moment from 'moment';
// console.log(moment);

// console.log(111, 'TEST', TEST);
// console.log(111, 'src process.env.NODE_ENV', process.env.NODE_ENV);

// import { fn1 } from './funcs';
// fn1();

// 不可达代码会被 treeshaking
// if (false) {
//   console.log(111, 'false');
// }

// 返回值没有被使用会被 treeshaking
// import { fn2 } from './funcs';
// fn2();

// 只定义而没有使用的变量会被 treeshaking
// var aaa = 'aaa';
// aaa = 'bbb';

let play = document.getElementById('play');
play.addEventListener('click', () => {
  import(/* webpackChunkName: 'video', webpackPrefetch: true */ './video').then(
    (res) => {
      console.log(111, 'res', res);
    }
  );
});
