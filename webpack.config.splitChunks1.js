const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 提示
const FrientlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');

// 分析
const Speed = require('speed-measure-webpack5-plugin');
const smw = new Speed();
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// html
const HtmlWepackPlugin = require('html-webpack-plugin');
// 图片
// const ImageWebpackLoader = require('image-webpack-loader');

// 资源
const icon = path.resolve(__dirname, 'icon.png');
const loadersPath = path.resolve(__dirname, 'loaders');
// 这里我们需要的是 css, 而不是 js
const bootstrap = path.resolve(
  __dirname,
  'node_modules/bootstrap/dist/css/bootstrap.css'
);

require('dotenv').config();

module.exports = {
  // mode: 'production', // mode
  mode: 'development', // mode
  // devtool: 'source-map',
  devtool: 'inline-source-map',
  context: process.cwd(),
  entry: {
    page1: './src/page1.js',
    page2: './src/page2.js',
    page3: './src/page3.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // 默认只分隔异步模块 async, all = init + async
      minSize: 0, // 分割出去的代码的最小体积，0表示不限制
      maxSize: 0, // 分割出去的代码的最大体积，0表示不限制
      minChunks: 1, // 如果此模块被多个入口引用几次会被分割
      maxAsyncRequests: 30, // 异步模块最大分割出去几个
      maxInitialRequests: 30, // 同步模块最大分割出去几个
      automaticNameDelimiter: '~', // 名称的分隔符
      enforceSizeThreshold: 50000, // 阈值 ?
      cacheGroups: {
        // 缓存组配置，配置如何对模块分组
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10, // 如果一个模块同属于多个缓存组，应该分到哪里
          reuseExistingChunk: true // 是否可复用现有的代码块
        },
        default: {
          minChunks: 2, // 此模块被2个入口引用过就提取
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    // noParse: /title.js/, // 不需要解析的模块, 适合那种没有其他依赖的模块也就是内部不能有 import require 等语法， 比如 lodash; 这里 设置 title.js 后，它的依赖 name.js就不会被解析打包了
    rules: [
      {
        // 默认每个文件对于rules中的所有规则都会遍历一遍，加了oneOf后只要匹配一个即可退出
        oneOf: [
          {
            test: /\.js/,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/, // 优先级高于include, 尽量避免exclude, 更倾向于使用include
            use: [
              // {
              //   loader: 'thread-loader', // 放在它后面的loader会在一个单独的worker池中运行。一般不要用，因为开启线程池和线程通信都需要时间，项目特别多的时候可以使用
              //   options: { workers: 3 } // 系统 cpu核数-1
              // },
              // 'babel-loader'
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true
                }
              }
            ]
          },
          {
            test: /\.css/,
            use: ['cache-loader', 'logger-loader', 'style-loader', 'css-loader']
          },
          {
            test: /\.less/,
            use: ['style-loader', 'css-loader', 'less-loader']
          },
          {
            test: /\.(jpg|png|gif|bmp)$/,
            use: [
              'file-loader',
              {
                loader: 'image-webpack-loader',
                options: {
                  mozjpeg: {
                    progressive: true
                  },
                  optipng: {
                    enabled: false
                  },
                  pngquant: {
                    quality: [0.65, 0.9],
                    speed: 4
                  },
                  gifsicle: {
                    interlaced: false
                  },
                  webp: {
                    quality: 75
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWepackPlugin({
      template: './src/index.html',
      filename: 'page1.html',
      chunks: ['page1']
    }),
    new HtmlWepackPlugin({
      template: './src/index.html',
      filename: 'page2.html',
      chunks: ['page2']
    }),
    new HtmlWepackPlugin({
      template: './src/index.html',
      filename: 'page3.html',
      chunks: ['page3']
    }),
    // 编译错误时使用系统弹窗提示
    new FrientlyErrorsWebpackPlugin({
      onErrors: (severity, errors) => {
        let error = errors[0];
        notifier.notify({
          title: 'webpack 编译失败',
          message: severity + ': ' + error.name,
          subtitle: error.file || '',
          icon
        });
      }
    }),
    new CleanWebpackPlugin()
  ]
};
