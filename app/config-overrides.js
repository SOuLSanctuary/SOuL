const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "zlib": require.resolve("browserify-zlib"),
        "path": require.resolve("path-browserify"),
        "fs": false,
        "ws": require.resolve("ws"),
        "tls": false,
        "net": false,
        "child_process": false
    });
    config.resolve.fallback = fallback;

    // Add aliases for rpc-websockets
    config.resolve.alias = {
        ...config.resolve.alias,
        'rpc-websockets/dist/lib/client': path.resolve(__dirname, 'node_modules/rpc-websockets/dist/lib/client'),
        'rpc-websockets/dist/lib/client/websocket.browser': path.resolve(__dirname, 'node_modules/rpc-websockets/dist/lib/client/websocket.browser')
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ]);

    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    });

    // Add specific loader for rpc-websockets
    config.module.rules.push({
        test: /node_modules\/rpc-websockets\/.*\.js$/,
        loader: require.resolve('babel-loader'),
        options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
        }
    });

    config.ignoreWarnings = [/Failed to parse source map/];

    return config;
};
