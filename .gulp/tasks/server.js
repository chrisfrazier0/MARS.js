const express = require('express')
const morgan = require('morgan')
const log = require('fancy-log')
const { Writable } = require('stream')

const port = 3000
const root = './demo'

const logger = new Writable({
    write(chunk, encoding, done) {
        log(chunk.toString('utf8').trim())
        done()
    },
})

module.exports = function(gulp) {
    gulp.task('server', () => {
        const app = express()
        app.disable('x-powered-by')
        app.use(
            morgan('dev', { stream: logger }),
            express.static(root),
        )
        return app.listen(port, err => {
            if (err) throw err
            log(`Server started: \x1B[35mhttp://localhost:${port}/\x1B[0m`)
        })
    })
}
