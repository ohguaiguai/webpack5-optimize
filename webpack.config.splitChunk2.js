const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 提示
const FrientlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');

// html
const HtmlWepackPlugin = require('html-webpack-plugin');

// 资源
const icon = path.resolve(__dirname, 'icon.png');
require('dotenv').config();

module.exports = {
  // mode: 'production', // mode
  mode: 'development', // mode
  // devtool: 'source-map',
  devtool: 'inline-source-map',
  context: process.cwd(),
  entry: {
    entry1: './src/entry1.js',
    entry2: './src/entry2.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // 默认只分隔异步模块 async, all = init + async
      minSize: 0, // 分割出去的代码的最小体积，0表示不限制
      maxSize: 0, // 分割出去的代码的最大体积，0表示不限制
      cacheGroups: {
        default: false, // 禁用默认缓存组
        commons: {
          // 自定义缓存组
          minChunks: 1, // 一般是被引用2次以及以上才会被提取
          reuseExistingChunk: false // 如果是 true表示复用，那么打出来bundle是A1.js, 否则的话就是commons-src_A_js.js, 虽然还是同一个文件，但是名称变了
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
      filename: 'entry1.html',
      chunks: ['entry1']
    }),
    new HtmlWepackPlugin({
      template: './src/index.html',
      filename: 'entry2.html',
      chunks: ['entry2']
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
