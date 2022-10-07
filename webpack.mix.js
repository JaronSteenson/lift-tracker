const mix = require('laravel-mix');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let plugins = [new BundleAnalyzerPlugin()];

if (mix.inProduction()) {
    mix.disableNotifications();
} else {
    mix.options({
        hmrOptions: {
            host: 'localhost',
            port: '8081',
        },
    });

    mix.sourceMaps().webpackConfig({
        plugins,
        devServer: {
            port: '8081',
        },
    });
}

mix.js('resources/js/app.js', 'public/js')
    .setResourceRoot('resources')
    .vue({
        version: 2,
        extractStyles: 'public/js/app-custom.css',
    })
    .version();
