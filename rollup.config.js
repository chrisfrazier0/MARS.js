const { terser } = require('rollup-plugin-terser')

module.exports = {
    input: './src/mars.js',
    output: {
        file: './dist/mars.js',
        format: 'esm',
    },
    plugins: [
        terser(),
    ],
}
