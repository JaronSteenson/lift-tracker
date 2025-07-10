const webpack = require("webpack");
const mix = require("laravel-mix");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { join } = require("node:path");

let publicPath = "https://lift-tracker.app/";
if (mix.inProduction()) {
    let optionalPlugins = [];
    if (process.env.ANALYZE_BUNDLE) {
        optionalPlugins.push(new BundleAnalyzerPlugin());
    } else {
        mix.disableNotifications();
    }

    mix.webpackConfig({
        plugins: [
            ...optionalPlugins,
            new HtmlWebpackPlugin({
                template: "resources/index.html", // optional, use your own template
                inject: true,
            }),
            new webpack.DefinePlugin({
                "process.env.API_BASE_URL": JSON.stringify("/api"),
            }),
        ],
    });
} else {
    const port = 8081;
    publicPath = `http://localhost:${port}`;

    console.log(`Running in development mode at: ${publicPath}`);

    mix.webpackConfig({
        plugins: [
            new HtmlWebpackPlugin({
                template: "resources/index.html",
                inject: true,
            }),
            new webpack.DefinePlugin({
                "process.env.API_BASE_URL": JSON.stringify(
                    "http://localhost:5299"
                ),
            }),
        ],
        devServer: {
            static: {
                directory: join(__dirname, "public"),
            },
            historyApiFallback: true,
            port,
            hot: true,
            client: {
                webSocketURL: `ws://localhost:${port}/ws`,
            },
        },
        output: {
            publicPath,
        },
    });
}

mix.js("resources/js/app.js", "public/js")
    .setResourceRoot("resources")
    .vue({
        version: 2,
        extractStyles: "public/js/app-custom.css",
    })
    .sourceMaps(true, "source-map")
    .version();
