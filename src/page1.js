// import _ from 'lodash';
// console.log(111, _);

import module1 from './module1';
import module2 from './module2';
import $ from 'jquery';

console.log(111, module1, module2, $);

import(/*webpackChunkName: 'asyncModule'*/ './asyncModule').then((res) => {
  console.log(111, 'res', res);
});
