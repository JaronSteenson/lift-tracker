const webpack = require('webpack');
const mix = require('laravel-mix');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('node:path');

require('./ci/version-service-worker');

const port = 8081;

if (mix.inProduction()) {
    mix.disableNotifications();
} else {
    console.log(
        `Running in development mode at: http://localhost:${port}`,
        '\r\n',
    );
}
mix.setPublicPath('dist');

mix.webpackConfig((webpack) => ({
    plugins: [
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(true),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true),
        }),
        new HtmlWebpackPlugin({
            template: 'resources/index.html',
            inject: true,
        }),
        process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : null,
    ].filter(Boolean),
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.esm-bundler.js',
        },
    },
    devServer: mix.inProduction()
        ? undefined
        : {
              static: {
                  directory: join(__dirname, 'dist'),
              },
              hot: true,
              host: 'localhost',
              port: 8081,
              historyApiFallback: true,
              client: {
                  webSocketURL: {
                      hostname: 'localhost',
                      port: 8081,
                      pathname: '/ws',
                  },
              },
          },
    output: mix.inProduction()
        ? {
              filename: '[name].[contenthash].js',
              chunkFilename: '[name].[contenthash].js',
              publicPath: '', // relative URLs for assets
          }
        : {
              filename: '[name].js',
              chunkFilename: '[name].js',
              publicPath: 'http://localhost:8081/',
          },
}));

mix.setResourceRoot('resources')
    .js('resources/js/app.js', 'js')
    .vue({
        version: 3,
    })
    .sourceMaps(true, 'source-map')
    .options({
        processCssUrls: false,
    });
