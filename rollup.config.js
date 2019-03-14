const { terser } = require('rollup-plugin-terser')

module.exports = {
    input: './src/jmars.js',
    output: {
        file: './dist/jmars.js',
        format: 'esm',
    },
    plugins: [
        terser(),
    ],
}
