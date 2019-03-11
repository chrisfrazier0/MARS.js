const clean = require('gulp-clean')
const { src, dest, series, parallel, watch } = require('gulp')
const { join } = require('path')
const { spawn } = require('child_process')


const copy = function() {
    return src('./src/**/*').pipe(dest('./demo/lib'))
}


const clean_demo = function() {
    return src(
        ['./demo/lib/**/*', '!.gitignore'],
        { read: false, allowEmpty: true }
    ).pipe(clean())
}


const server = function() {
    const cmd = join(__dirname, 'node_modules', '.bin', 'dev-server')
    const child = spawn(cmd, ['-r', 'demo'], { shell: true })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    return child
}
const start_watch = function() {
    watch('./src/**/*', copy)
}
const dev = series(clean_demo, copy, parallel(server, start_watch))


module.exports = {
    copy,
    clean: clean_demo,
    dev,
    default: dev,
}
