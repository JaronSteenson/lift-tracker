const mix = require('laravel-mix');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let plugins = [new BundleAnalyzerPlugin()];

if (mix.inProduction()) {
    //
} else {
    mix.sourceMaps();
}

mix.js('resources/js/app.js', 'public/js')
    .webpackConfig({ plugins })
    .version();
