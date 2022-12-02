const path = require('path');
const webpack = require('webpack');

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

// 默认的 mode(production) < webpack.config中的mode < 命令行中的mode --mode=xxx
// mode 影响的是源文件中的 process.env.NODE_ENV
module.exports = {
  mode: 'none', // mode
  devtool: 'source-map',
  context: process.cwd(),
  entry: {
    main: './src/index.js' // 对应：asset main.js 167 bytes [emitted] (name: main)
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: { bootstrap },
    modules: ['c:/node_modules', 'node_modules'],
    mainFields: ['browser', 'module', 'main'],
    mainFiles: ['index']
  },
  resolveLoader: {
    // 只针对 loader
    modules: [loadersPath, 'node_modules'] // 注意要加上 node_modules
  },
  externals: {
    jquery: 'jQuery'
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
      template: './src/index.html'
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
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // 不启动展示打包结果的HTTP服务器
      generateStatsFile: true // 要生成stats.json文件, 每次打包都会在dist文件夹下生成一个stats.json 文件，后面如果想看报告，可以执行 npm run analyzer
    }),
    new webpack.DefinePlugin({
      // 定义的变量是在编译阶段使用，运行阶段就已经是值了
      // 值必须是字符串，否则运行阶段的结果就是个变量了，会报错
      TEST: JSON.stringify('dev'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) // 这样就可以把node环境中的 process.env.NODE_ENV 传递给模块了
    })
  ]
};

// build: webpack --env=development, 这种情况下需要用函数来接收 env
// module.exports = (env) => {
//   console.log(111, 'env', env);
//   console.log(111, 'webpck process.env.NODE_ENV', process.env.NODE_ENV);

//   return {
//     mode: 'development', // mode
//     devtool: 'source-map',
//     context: process.cwd(),
//     entry: {
//       main: './src/index.js' // 对应：asset main.js 167 bytes [emitted] (name: main)
//     },
//     output: {
//       path: path.resolve(__dirname, 'dist'),
//       filename: '[name].js'
//     },
//     resolve: {
//       extensions: ['.js', '.jsx', '.json'],
//       alias: { bootstrap },
//       modules: ['c:/node_modules', 'node_modules'],
//       mainFields: ['browser', 'module', 'main'],
//       mainFiles: ['index']
//     },
//     resolveLoader: {
//       // 只针对 loader
//       modules: [loadersPath, 'node_modules'] // 注意要加上 node_modules
//     },
//     externals: {
//       jquery: 'jQuery'
//     },
//     module: {
//       // noParse: /title.js/, // 不需要解析的模块, 适合那种没有其他依赖的模块也就是内部不能有 import require 等语法， 比如 lodash; 这里 设置 title.js 后，它的依赖 name.js就不会被解析打包了
//       rules: [
//         {
//           // 默认每个文件对于rules中的所有规则都会遍历一遍，加了oneOf后只要匹配一个即可退出
//           oneOf: [
//             {
//               test: /\.js/,
//               include: path.resolve(__dirname, 'src'),
//               exclude: /node_modules/, // 优先级高于include, 尽量避免exclude, 更倾向于使用include
//               use: [
//                 // {
//                 //   loader: 'thread-loader', // 放在它后面的loader会在一个单独的worker池中运行。一般不要用，因为开启线程池和线程通信都需要时间，项目特别多的时候可以使用
//                 //   options: { workers: 3 } // 系统 cpu核数-1
//                 // },
//                 // 'babel-loader'
//                 {
//                   loader: 'babel-loader',
//                   options: {
//                     cacheDirectory: true
//                   }
//                 }
//               ]
//             },
//             {
//               test: /\.css/,
//               use: [
//                 'cache-loader',
//                 'logger-loader',
//                 'style-loader',
//                 'css-loader'
//               ]
//             },
//             {
//               test: /\.less/,
//               use: ['style-loader', 'css-loader', 'less-loader']
//             },
//             {
//               test: /\.(jpg|png|gif|bmp)$/,
//               use: [
//                 'file-loader',
//                 {
//                   loader: 'image-webpack-loader',
//                   options: {
//                     mozjpeg: {
//                       progressive: true
//                     },
//                     optipng: {
//                       enabled: false
//                     },
//                     pngquant: {
//                       quality: [0.65, 0.9],
//                       speed: 4
//                     },
//                     gifsicle: {
//                       interlaced: false
//                     },
//                     webp: {
//                       quality: 75
//                     }
//                   }
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     },
//     plugins: [
//       new HtmlWepackPlugin({
//         template: './src/index.html'
//       }),
//       // 编译错误时使用系统弹窗提示
//       new FrientlyErrorsWebpackPlugin({
//         onErrors: (severity, errors) => {
//           let error = errors[0];
//           notifier.notify({
//             title: 'webpack 编译失败',
//             message: severity + ': ' + error.name,
//             subtitle: error.file || '',
//             icon
//           });
//         }
//       }),
//       new BundleAnalyzerPlugin({
//         analyzerMode: 'disabled', // 不启动展示打包结果的HTTP服务器
//         generateStatsFile: true // 要生成stats.json文件, 每次打包都会在dist文件夹下生成一个stats.json 文件，后面如果想看报告，可以执行 npm run analyzer
//       }),
//       new webpack.IgnorePlugin({
//         resourceRegExp: /^\.\/locale$/, // 资源正则
//         contextRegExp: /moment$/ // 要忽略的目录正则
//       }),
//       new webpack.DefinePlugin({
//         // 定义的变量是在编译阶段使用，运行阶段就已经是值了
//         // 值必须是字符串，否则运行阶段的结果就是个变量了，会报错
//         TEST: JSON.stringify('dev'),
//         'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) // 这样就可以把node环境中的 process.env.NODE_ENV 传递给模块了
//       })
//     ]
//   };
// };
