module.exports = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
    ],
    plugins: [
        'const-enum', ["@babel/plugin-proposal-decorators", { "legacy": true }],
        '@babel/plugin-proposal-class-properties',
        'babel-plugin-transform-typescript-metadata',
        '@babel/plugin-transform-runtime'
    ]
}