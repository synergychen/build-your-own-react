const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        main: './main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // Transform modern javascript code
                        presets: ['@babel/preset-env'],
                        // Enabel JSX syntax
                        plugins: [
                            [
                                '@babel/plugin-transform-react-jsx',
                                { pragma: 'createElement' }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: './dist/index.html'
        })
    ],
    mode: 'development',
    optimization: {
        minimize: false
    }
}
