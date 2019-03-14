const clean = require('gulp-clean')
const pages = require('gulp-gh-pages')
const { task, src, dest, series, parallel, watch } = require('gulp')
const { join } = require('path')
const { spawn } = require('child_process')


task('copy', () => src('./src/**/*').pipe(dest('./demo/lib')))


const pat = ['./demo/lib/**/*', '!.gitignore']
const opts = { read: false, allowEmpty: true }
const clean_demo = function() {
    return src(pat, opts).pipe(clean())
}
const clean_pub = function() {
    return src('./.publish', opts).pipe(clean())
}
task('clean', parallel(clean_demo, clean_pub))


task('server', () => {
    const cmd = join(__dirname, 'node_modules', '.bin', 'dev-server')
    const child = spawn(cmd, ['-r', 'demo'], { shell: true })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    return child
})
task('watch', () => watch('./src/**/*', task('copy')))
task('dev', series('clean', 'copy', parallel('server', 'watch')))


const copy_dist = function() {
    return src('./dist/**/*').pipe(dest('./demo/lib'))
}
const gh_pages = function() {
    return src('./demo/**/*').pipe(pages())
}
task('deploy', series('clean', copy_dist, gh_pages))


task('default', task('dev'))
