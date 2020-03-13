import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { DefinePlugin, Configuration } from 'webpack'
import path from 'path'
import fs from 'fs-extra'
import WorkboxPlugin from 'workbox-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'

process.env.NODE_ENV = 'development'

const bin = path.resolve(__dirname, '..', '..', 'bin')
const publicPath = path.resolve(__dirname, '..', '..', 'public')

const development = {
  mode: 'development' as const,
  name: 'client',
  watch: true,
  entry: [path.resolve(bin, 'client', 'index.jsx')],
  output: {
    path: path.resolve(bin, 'server', 'build'),
    publicPath: '/app',
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      assets: path.resolve(bin, 'client', 'assets')
    }
  },
  optimization: {
    minimize: false,
    // @ts-ignore
    minimizer: [],
    splitChunks: {
      chunks: 'all' as const
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(bin, 'client'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: true,
          compact: true,
          presets: [
            '@babel/preset-react'
          ],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-proposal-object-rest-spread'
          ]
        }
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|webp)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(publicPath, 'index.html'),
      filename: 'index.html'
    }),
    new MiniCSSExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].chunk.css'
    }),
    new DefinePlugin({
      __PAYPAL_ENV__: '"sandbox"'
    }),
    {
      apply: (compiler: any) =>
        compiler.hooks.compile.tap('miscFiles', () => {
          const appDir = path.resolve(bin, 'client')
          const appFile = fs.readFileSync(path.resolve(appDir, 'App.jsx'), 'utf8')

          const sitemapTemplate = fs.readFileSync(path.resolve(publicPath, 'sitemap.xml'), 'utf8')
          let sitemapLocations = ''
          for (const [, match] of appFile.matchAll(/path="(.*?)"/g)) {
            sitemapLocations += `<url><loc>https://points.city${match}</loc></url>`
          }

          fs.writeFileSync(
            path.resolve(publicPath, 'sitemap.xml'),
            sitemapTemplate.replace('$locations', sitemapLocations)
          )
          fs.copyFileSync(
            path.resolve(publicPath, 'robots.txt'),
            path.resolve(publicPath, 'robots.txt')
          )
        })
    }
  ]
}

const production = {
  mode: 'production' as const,
  name: 'client',
  entry: [path.resolve(bin, 'client', 'index.jsx')],
  output: {
    path: path.resolve(bin, 'server', 'build'),
    publicPath: '/app',
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      assets: path.resolve(bin, 'client', 'assets')
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            inline: 2
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        cache: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: false
        }
      })
    ],
    splitChunks: {
      chunks: 'all' as const
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(bin, 'client'),
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: true,
          compact: true,
          presets: [
            '@babel/preset-react'
          ],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-export-default-from',
            '@babel/plugin-proposal-object-rest-spread'
          ]
        }
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|webp)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(publicPath, 'index.html'),
      filename: 'index.html'
    }),
    new MiniCSSExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].chunk.css'
    }),
    new DefinePlugin({
      __PAYPAL_ENV__: '"production"'
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    }),
    {
      apply: (compiler: any) =>
        compiler.hooks.compile.tap('cleanBuild', () => {
          const buildDir = path.resolve(bin, 'server', 'build')
          for (const filename of fs.readdirSync(buildDir)) {
            fs.unlinkSync(path.resolve(buildDir, filename))
          }
        })
    },
    {
      apply: (compiler: any) =>
        compiler.hooks.compile.tap('miscFiles', () => {
          const appDir = path.resolve(bin, 'client')
          const appFile = fs.readFileSync(path.resolve(appDir, 'App.jsx'), 'utf8')

          const sitemapTemplate = fs.readFileSync(path.resolve(publicPath, 'sitemap.xml'), 'utf8')
          let sitemapLocations = ''
          for (const [, match] of appFile.matchAll(/path="(.*?)"/g)) {
            sitemapLocations += `<url><loc>https://typapp.co${match}</loc></url>`
          }

          fs.writeFileSync(
            path.resolve(publicPath, 'sitemap.xml'),
            sitemapTemplate.replace('$locations', sitemapLocations)
          )
          fs.copyFileSync(
            path.resolve(publicPath, 'robots.txt'),
            path.resolve(publicPath, 'robots.txt')
          )
        })
    }
  ]
}

export default process.argv.includes('-p') ? production : development
