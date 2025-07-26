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
    output: mix.inProduction() ?
        {
            filename: '[name].[contenthash].js',
            chunkFilename: '[name].[contenthash].js',
            publicPath: '', // relative URLs for assets
        } : {
            filename: '[name].js',
            chunkFilename: '[name].js',
            publicPath: 'http://localhost:8081/',
    },
});

mix.setResourceRoot('resources')
    .js('resources/js/app.js', 'js')
    .vue({
        version: 2,
    })
    .sourceMaps(true, 'source-map');
