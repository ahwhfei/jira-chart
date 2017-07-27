module.exports = {
    entry: './src/main.ts',
    output: {
        filename: '[name].js',
        path: './dist'
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
            }
        ]
   }
}