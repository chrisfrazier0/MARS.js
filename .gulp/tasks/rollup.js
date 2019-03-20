const rollup = require('../plugins/rollup-stream')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const terser = require('gulp-terser')

const esm_opts = {
    input: './src/mars.js',
    output: 'esm',
}
const umd_opts = {
    input: './src/mars.js',
    output: {
        format: 'umd',
        name: 'MARS',
    },
}

module.exports = function(gulp) {
    gulp.task('rollup:esm', () => rollup(esm_opts)
        .pipe(source('mars.esm.js'))
        .pipe(buffer())
        .pipe(terser())
        .pipe(gulp.dest('./dist')))

    gulp.task('rollup:umd', () => rollup(umd_opts)
        .pipe(source('mars.js'))
        .pipe(buffer())
        .pipe(terser())
        .pipe(gulp.dest('./dist')))

    gulp.task('rollup', gulp.parallel('rollup:esm', 'rollup:umd'))
}
