const mix = require('laravel-mix');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let plugins = [new BundleAnalyzerPlugin()];

if (mix.inProduction()) {
    mix.disableNotifications();
} else {
    mix.sourceMaps().webpackConfig({ plugins });
}

mix.js('resources/js/app.js', 'public/js').vue({ version: 2 }).version();
