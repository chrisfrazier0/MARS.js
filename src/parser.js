import preprocess from './preproc.js'
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
        const found = this.type === this.value ? this.type : this.type + ':' + this.value
        throw new SyntaxError(`Expected expression but found "${found}" at ${this.line}:${this.col}`)
    },
    led() {
        throw new Error('Missing operator led() definition')
    },
}

const advance = function(type) {
    if (type !== undefined && la.type !== type) {
        const ex = type === '\n' ? 'instruction or EOL' : '"' + type + '"'
        const found = la.type === la.value ? la.type : la.type + ':' + la.value
        throw new SyntaxError(`Expected ${ex} but found "${found}" at ${la.line}:${la.col}`)
    }
    const s = la
    const t = lex()
    const o = symbol(t.type === 'punc' ? t.value : t.type)
    la = Object.create(o)
    la.value = t.value
    la.col = t.col
    la.line = t.line
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
    const input = preprocess(str)
    lex = lexer(...input)
    advance()
    return statements()
}
