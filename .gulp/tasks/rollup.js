const rollup = require('../plugins/rollup-stream')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const terser = require('gulp-terser')

const roll_opts = {
    input: './src/mars.js',
    output: 'esm',
}

module.exports = function(gulp) {
    gulp.task('rollup', () => rollup(roll_opts)
        .pipe(source('mars.js'))
        .pipe(buffer())
        .pipe(terser())
        .pipe(gulp.dest('./dist')))
}
