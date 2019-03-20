const rename = require('gulp-rename')
const changed = require('gulp-changed')
const clean = require('gulp-clean')

const path = [
    './demo/lib/**/*',
    '!.gitignore',
]
const src_opts = {
    read: false,
    allowEmpty: true,
}

module.exports = function(gulp) {
    gulp.task('copy:src', () => gulp.src('./src/**/*')
        .pipe(gulp.dest('./demo/lib')))

    gulp.task('copy:src:new', () => gulp.src('./src/**/*')
        .pipe(changed('./demo/lib'))
        .pipe(gulp.dest('./demo/lib')))

    gulp.task('copy:dist', () => gulp.src('./dist/mars.esm.js')
        .pipe(rename('mars.js'))
        .pipe(gulp.dest('./demo/lib')))

    gulp.task('copy:clean', () => gulp.src(path, src_opts)
        .pipe(clean()))

    gulp.task('copy:watch', () => gulp.watch('./src/**/*', gulp.task('copy:src:new')))
}
