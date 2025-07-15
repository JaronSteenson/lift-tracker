const webpack = require('webpack');
const mix = require('laravel-mix');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('node:path');

const port = 8081;

if (mix.inProduction()) {
    mix.disableNotifications();
} else {
    console.log(`Running in development mode at: http://localhost:${port}`);
}
mix.setPublicPath('dist');

mix.webpackConfig({
    plugins: [
        new HtmlWebpackPlugin({
            template: 'resources/index.html',
            inject: true,
        }),
        new webpack.DefinePlugin({
            'process.env.API_BASE_URL': JSON.stringify(
                mix.inProduction() ? '/api' : 'http://localhost:5299/api'
            ),
        }),
        process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : null,
    ].filter(Boolean),
    devServer: mix.inProduction()
        ? undefined
        : {
              static: {
                  directory: join(__dirname, 'dist'),
              },
              historyApiFallback: true,
              port,
              hot: true,
              client: {
                  webSocketURL: `ws://localhost:${port}/ws`,
              },
          },
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
        publicPath: '', // relative URLs for assets
    },
});

mix.setResourceRoot('resources')
    .js('resources/js/app.js', 'js')
    .vue({
        version: 2,
    })
    .sourceMaps(true, 'source-map');
