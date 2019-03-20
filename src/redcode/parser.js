let lex, la, org, labels, count
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
    std() {
        const found = this.type === this.value ? this.type : this.type + ':' + this.value
        throw new SyntaxError(`Expected instruction but found "${found}" at ${this.line}:${this.col}`)
    },
    nud() {
        const found = this.type === this.value ? this.type : this.type + ':' + this.value
        throw new SyntaxError(`Expected expression but found "${found}" at ${this.line}:${this.col}`)
    },
    led() {
        throw new Error('Missing operator led() definition')
    },
}

const create_symbol = function(type, value) {
    const s = Object.create(symbol(type))
    if (value !== undefined) s.value = value
    return s
}

const advance = function(type) {
    if (type !== undefined && la.type !== type) {
        const ex = type === '\n' ? 'EOL' : '"' + type + '"'
        const found = la.type === la.value ? la.type : la.type + ':' + la.value
        throw new SyntaxError(`Expected ${ex} but found "${found}" at ${la.line}:${la.col}`)
    }
    const s = la
    const t = lex()
    la = create_symbol(t.type === 'punc' ? t.value : t.type, t.value)
    la.col = t.col
    la.line = t.line
    return s
}

const statements = function() {
    const a = []
    while (la.type !== 'eof') {
        const s = advance().std()
        if (s === false) break
        else if (s !== undefined) a.push(s)
    }
    return a
}

const label = function() {
    labels.set(this.value, count)
    if (la.type === ':') advance()
    if (la.type === 'opcode') {
        return advance().std()
    } else if (la.type !== 'eof') {
        advance('\n')
    }
}

const opcode = function() {
    count += 1
    const s = create_symbol('instruction', this.value)
    if (la.type === '.') {
        advance()
        s.modifier = advance('modifier').value
    }
    s.a = reference()
    if (la.type === ',') {
        advance()
        s.b = reference()
    } else if (s.value.toUpperCase() !== 'DAT') {
        s.b = create_symbol('operand', create_symbol('number', 0))
        s.b.mode = '$'
    } else {
        s.b = s.a
        s.a = create_symbol('operand', create_symbol('number', 0))
        s.a.mode = '$'
    }
    if (la.type !== 'eof') advance('\n')
    return s
}

const reference = function() {
    const r = create_symbol('operand')
    if (la.type === 'mode' || la.type === '*') {
        r.mode = advance().value
    } else {
        r.mode = '$'
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

symbol('org').std = function() {
    org = expression()
    if (la.type !== 'eof') advance('\n')
}
symbol('end').std = function() {
    if (la.type !== '\n' && la.type !== 'eof') {
        org = expression()
        if (la.type !== 'eof') advance('\n')
    }
    return false
}

symbol('label').std = label
symbol('modifier').std = label
symbol('opcode').std = opcode
symbol('\n').std = function() {}

symbol('number').nud = itself
symbol('label').nud = itself
symbol('modifier').nud = itself
symbol('(').nud = function() {
    const e = expression()
    advance(')')
    return e
}

infix('+', 10)
infix('-', 10)
infix('*', 20)
infix('/', 20)
infix('%', 20)

prefix('-', 30)

export default function parse(input) {
    lex = input
    org = create_symbol('number', 0)
    labels = new Map()
    count = 0
    advance()
    const stmts = statements()
    return [org, labels, stmts]
}
