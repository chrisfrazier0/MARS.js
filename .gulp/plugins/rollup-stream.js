const rollup = require('rollup')
const { Readable } = require('stream')

module.exports = function(options) {
    const stream = new Readable({ read() {} })
    if (typeof options.input === 'string') {
        options.input = { input: options.input }
    }
    if (typeof options.output === 'string') {
        options.output = { format: options.output }
    }
    rollup.rollup(options.input)
    .then(bundle => {
        stream.emit('bundle', bundle)
        return bundle.generate(options.output)
    }).then(result => {
        const { code, map } = result.output[0]
        stream.push(code)
        if (map !== null) {
            stream.push('\n//# sourceMappingURL=')
            stream.push(map.toUrl())
        }
        stream.push(null)
    }).catch(err => {
        stream.emit('error', err)
    })
    return stream
}
