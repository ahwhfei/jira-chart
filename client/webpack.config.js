const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        port: 8088,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },
    devtool: 'source-map',
    entry: path.resolve('src-angular', 'main.ts'),
    externals: {
        d3: 'd3'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                loader: 'ts-loader',
                test: /\.ts$/,
            },
            {
                exclude: /node_modules/,
                loader: 'raw-loader',
                test: /\.html$/,
            },
            {
                exclude: /node_modules/,
                loaders: ['raw-loader', 'less-loader'],
                test: /\.less$/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src-angular/index.html'
        })
    ],
    resolve: {
        extensions: ['.js', '.ts']
    }
}