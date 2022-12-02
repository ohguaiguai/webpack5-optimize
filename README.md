## install

```sh
npm install webpack webpack-cli html-webpack-plugin webpack-dev-server cross-dev -D

npm i friendly-errors-webpack-plugin node-notifier -D

npm i speed-measure-webpack5-plugin -D

npm i webpack-bundle-analyzer -D

npm i terser-webpack-plugin optimize-css-assets-webpack-plugin image-webpack-loader -D
npm i purgecss-webpack-plugin mini-css-extract-plugin -D
```

## 编译时间优化

- 减少要处理的文件
- 缩小查找的范围
  - resolve
    - extensions 指定文件的扩展名
    - alias 指定别名
    - modules 指定查找目录：包所在的 node_modules 所在路径
    - mainFields 从包的 package.json 中的哪个字段查找入口文件, 一般包的这字段都是 main
    - mainFiles 如果找不到 mainFileds 的话会找索引文件 index.js
  - oneOf 默认每个文件对于 rules 中的所有规则都会遍历一遍，加了 oneOf 后只要匹配一个即可退出
  - externals 外部模块，不希望把库打包的时候使用
    - 一般使用 cdn 来引入，比如 `<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.1/jquery.js"></script>`项目中使用 import $ from 'jQuery', 此时 jQuery 就来自 window.jQuery
  - resolveLoader 指定 loader 的目录, 一般是给我们自己写的 loader 指定查找路径
- 多线程打包
  - thread-loader(happypack 已经不在维护)
- 利用缓存 缓存结果在 node_modules/.cache 下
  - babel-loader 提供了选项可以直接开启缓存
  - 其他没有缓存项的 loader 可以借助 cache-loader
  - hard-source-webpack-plugin 为模块提供了中间缓存，首次构建不会有太大变化，但是从第二次开始，构建时间大约可以减少 80% 左右。`webpack5 已经内置了模块缓存，不需要使用此插件`

## 编译体积优化

- terser-webpack-plugin 优化和压缩 js 资源，uglify 插件已经不推荐使用
- css 先提取再去掉无用 css 再压缩
  - mini-css-extract-plugin 提取 css, 因为 js 和 css 的加载可以并行
  - optimize-css-assets-webpack-plugin 优化和压缩 css
  - purgecss-webpack-plugin 干掉无用的 css
- image-webpack-loader 优化和压缩图片
- html-webpack-plugin 开启压缩

## 运行速度优化

- 代码分隔
  - 入口点分隔, 即 mpa
    - 问题：相同的代码会被重复打包
- 懒加载 import()

  问题：假如文件特别大，会有延迟比如路由切换

  - 可以使用 prefetch
  - preload 和 prefetch 的区别
    - preload 预加载，此资源一定会被加载，优先级最高，会抢占浏览器资源，需要慎用。
    - prefetch 预获取，此资源可能会用到，是在浏览器空闲时加载，没有性能问题。

- 提取公共代码

## 设置环境变量

node 环境中（也就是 webpack.config.js）如何获取 process.env.NODE_ENV?

有两种方法：

1. 通过 `build: cross-env NODE_ENV=dev webpack`。

- cross-env: 跨操作系统设置

2. 通过 `dotenv`, 创建 .env 文件。一般都是使用这种方法，传递环境变量到 node 环境，然后再通过 DefinePlugin 传递给模块

## treeshaking

> webpack5 中无论开发还是生成都会自动开启

### js treeshaking

- 不可达代码
- 返回值没有被使用
- 只定义而没有使用的变量

### css treeshaking

sideEffects 默认是 true，表示所有文件都有副作用，webpack 会保留这些副作用；false 表示所有文件都没有副作用可以放心去 treeshaking, 这个时候一些样式比如 `body {}` 可能就会被 treeshaking 掉，如果希望保留 css 而不被 treeshaking 需要在 package.json 中添加

```json
 "sideEffects": [
    "*.css"
  ],
```

## scope hoist

> 即作用域提升，当 mode 设置为 production 会自动开启

index.js

```js
import title from './title';
console.log(111, 'title', title);
```

title.js

```js
import name from './name';
export default 'title';
console.log(111, 'name', name);
```

name.js

```js
export default 'aa';
```

先看下不开启 scope hoist 的情况

```js
var __webpack_modules__ = {
  './src/index.js': (
    __unused_webpack_module,
    __webpack_exports__,
    __webpack_require__
  ) => {
    __webpack_require__.r(__webpack_exports__);
    var _title__WEBPACK_IMPORTED_MODULE_0__ =
      __webpack_require__('./src/title.js');
    console.log(111, 'title', _title__WEBPACK_IMPORTED_MODULE_0__.default);
  },
  './src/name.js': (
    __unused_webpack_module,
    __webpack_exports__,
    __webpack_require__
  ) => {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__
    });
    const __WEBPACK_DEFAULT_EXPORT__ = 'aa';
  },
  './src/title.js': (
    __unused_webpack_module,
    __webpack_exports__,
    __webpack_require__
  ) => {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      default: () => __WEBPACK_DEFAULT_EXPORT__
    });
    var _name__WEBPACK_IMPORTED_MODULE_0__ =
      __webpack_require__('./src/name.js');
    const __WEBPACK_DEFAULT_EXPORT__ = 'title';
    console.log(111, 'name', _name__WEBPACK_IMPORTED_MODULE_0__.default);
  }
};
```

可以看出三个模块对应三个函数

再看下开启 scope hoist 的情况, 最终的产物是

```js
(() => {
  'use strict';
  console.log(111, 'name', 'aa'), console.log(111, 'title', 'title');
})();
//# sourceMappingURL=main.js.map
```

可以看出，只剩下了一个函数, title.js 中的 log 被提升到了 index.js 中了
