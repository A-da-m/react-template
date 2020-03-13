import webpack from 'webpack'
import config from './webpack.config'

let lastHash: string

webpack(config)
  .watch({
    ignored: /node_modules/
  }, (error: Error, stats: webpack.Stats) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    }
    if (stats.hash === lastHash) {
      return
    }
    lastHash = stats.hash

    process.stdout.write(stats.toString({
      colors: true,
      hash: true,
      timings: true,
      chunks: false,
      modules: false,
      children: false
    }) + '\n\n')
  })
