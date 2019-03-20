module.exports = function(gulp) {
    /* eslint global-require: off */
    require('./copy')(gulp)
    require('./rollup')(gulp)
    require('./server')(gulp)
    require('./publish')(gulp)

    gulp.task('clean', gulp.parallel(
        'copy:clean',
        'publish:clean',
    ))

    gulp.task('publish', gulp.series(
        'clean',
        'copy:dist',
        'publish:gh',
    ))

    gulp.task('dev', gulp.parallel(
        'server',
        gulp.series('copy:clean', 'copy:src', 'copy:watch')
    ))

    gulp.task('default', gulp.task('dev'))
}
