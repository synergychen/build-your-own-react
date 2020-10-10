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
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    mode: 'development',
    optimization: {
        minimize: false
    }
}
