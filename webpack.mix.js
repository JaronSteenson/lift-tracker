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

mix.webpackConfig({
    plugins: [
        new HtmlWebpackPlugin({
            template: 'resources/index.html',
            inject: true,
        }),
        new webpack.DefinePlugin({
            'process.env.API_BASE_URL': mix.inProduction()
                ? JSON.stringify(`/api`)
                : JSON.stringify('http://localhost:5299/api'),
        }),
        process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : null,
    ].filter(Boolean),
    devServer: mix.inProduction()
        ? undefined
        : {
              static: {
                  directory: join(__dirname, 'static'),
              },
              historyApiFallback: true,
              port,
              hot: true,
              client: {
                  webSocketURL: `ws://localhost:${port}/ws`,
              },
          },
    output: {
        publicPath: mix.inProduction() ? '/static' : '',
    },
});

mix.setResourceRoot('resources')
    .js('resources/js/app.js', 'js')
    .vue({
        version: 2,
        extractStyles: 'js/app-custom.css',
    })
    .sourceMaps(true, 'source-map');
