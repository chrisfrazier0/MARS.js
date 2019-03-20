const pages = require('gulp-gh-pages')
const clean = require('gulp-clean')

const src_opts = {
    read: false,
    allowEmpty: true,
}

module.exports = function(gulp) {
    gulp.task('publish:gh', () => gulp.src('./demo/**/*')
        .pipe(pages()))

    gulp.task('publish:clean', () => gulp.src('./.publish', src_opts)
        .pipe(clean()))
}
