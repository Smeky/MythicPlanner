const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: [
        path.join(process.cwd(), 'client/app.js'),
    ],
    output: {
        path: path.join(process.cwd(), '/build'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    node: {
        fs: "empty"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                },
            },
            {
                test: /\.(css|scss)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(jpg|jpeg|png|ttf|woff|eot)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    }
                }
            }
        ],
    },
    resolve: {
        modules: ['client', 'node_modules'],
        extensions: [
            '.js',
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'client/index.html',
            inject: true
        }),
        new MinifyPlugin()
    ],
}