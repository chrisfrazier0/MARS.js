import lexer from './lexer.js'

let lex, la
const symbol_table = {}
const itself = function() { return this }

const symbol = function(type, bp = 0) {
    let s = symbol_table[type]
    if (s) {
        if (bp > s.lbp) {
            s.lbp = bp
        }
    } else {
        s = Object.create(symbol_original)
        s.type = s.value = type
        s.lbp = bp
        symbol_table[type] = s
    }
    return s
}

const symbol_original = {
    nud() {
        throw new SyntaxError('Expected expression')
    },
    led() {
        throw new Error('Missing operator led() definition')
    },
}

const advance = function(type) {
    if (type !== undefined && la.type !== type) {
        throw new SyntaxError(`Expected "${type}"`)
    }
    const s = la
    const t = lex()
    const o = symbol(t.type === 'punc' ? t.value : t.type)
    la = Object.create(o)
    la.value = t.value
    return s
}

const statements = function() {
    const a = []
    while (la.type !== 'eof') {
        const s = statement()
        if (s !== null) a.push(s)
    }
    return a
}

const statement = function() {
    const s = Object.create(symbol('instruction'))
    if (la.type === 'label' || la.type === 'modifier') {
        s.value = null
        s.label = advance().value
        if (la.type === ':') advance()
    }
    switch (la.type) {
    case 'org':
        s.value = advance().value
        s.a = reference(false)
        break
    case 'end':
        s.value = advance().value
        if (la.type !== '\n' && la.type !== 'eof') {
            s.a = reference(false)
        }
        break
    case 'opcode':
        s.value = advance().value
        if (la.type === '.') {
            advance()
            s.modifier = advance('modifier').value
        }
        s.a = reference()
        if (la.type === ',') {
            advance()
            s.b = reference()
        }
        break
    }
    if (la.type !== 'eof') {
        advance('\n')
    }
    return s.hasOwnProperty('value') ? s : null
}

const reference = function(mode = true) {
    const r = Object.create(symbol('operand'))
    if (mode && (la.type === 'mode' || la.type === '*')) {
        r.mode = advance().value
    }
    r.value = expression()
    return r
}

const expression = function(rbp = 0) {
    let s = advance()
    let left = s.nud()
    while (rbp < la.lbp) {
        s = advance()
        left = s.led(left)
    }
    return left
}

const infix = function(type, bp) {
    const s = symbol(type, bp)
    s.led = function(left) {
        this.first = left
        this.second = expression(bp)
        return this
    }
    return s
}

const prefix = function(type, bp) {
    const s = symbol(type)
    s.nud = function() {
        this.first = expression(bp)
        return this
    }
    return s
}

symbol('number').nud = itself
symbol('label').nud = itself
symbol('modifier').nud = itself
symbol('(').nud = function() {
    const e = expression(0)
    advance(')')
    return e
}

infix('+', 10)
infix('-', 10)
infix('*', 20)
infix('/', 20)
infix('%', 20)

prefix('-', 30)

export default function parse(str) {
    lex = lexer(str)
    la = undefined
    advance()
    return statements()
}
