import { make_regexp } from './util.js'

const modifiers = ['AB', 'BA', 'A', 'B', 'F', 'X', 'I']
const opcodes = ['DAT', 'MOV', 'ADD', 'SUB', 'MUL', 'DIV',
                 'MOD', 'JMP', 'JMZ', 'JMN', 'DJN', 'CMP',
                 'SEQ', 'SNE', 'SLT', 'SPL', 'NOP']

export default function lexer(str, macros = new Map()) {
    // Capture Groups
    // [1] Whitespace
    // [2] Comment
    // [3] Label
    // [4] Mode
    // [5] Number
    // [6] Punctuation
    const rx_token = make_regexp(String.raw`
        ( [\x20 \t \r \f \v]+ )
    |   ( ; [^\n]* )
    |   ( [a-z A-Z _] \w* )
    |   ( [# $ @ { } < >] )
    |   ( \d+ )
    |   ( [\n . , : ( ) + \- * / %] )
    `, 'y')

    let line = 1, col = 1
    const token = function(type, value) {
        const t = { type, value, line, col }
        col += value.length
        return t
    }

    const scan = function() {
        if (rx_token.lastIndex >= str.length) {
            return { type: 'eof', value: 'eof', line, col }
        }
        const index = rx_token.lastIndex
        const captives = rx_token.exec(str)
        if (captives === null) {
            throw new SyntaxError(`Unexpected character "${str[index]}" at ${line}:${col}`)
        } else if (captives[1] !== undefined || captives[2] !== undefined) {
            col += captives[0].length
        } else if (captives[3] !== undefined) {
            const v = captives[3].toUpperCase()
            if (v === 'ORG') {
                return token('org', captives[3])
            } else if (v === 'END') {
                return token('end', captives[3])
            } else if (opcodes.indexOf(v) !== -1) {
                return token('opcode', captives[3])
            } else if (modifiers.indexOf(v) !== -1) {
                return token('modifier', captives[3])
            } else if (macros.has(captives[3])) {
                str = macros.get(captives[3]) + str.slice(rx_token.lastIndex)
                rx_token.lastIndex = 0
            } else {
                return token('label', captives[3])
            }
        } else if (captives[4] !== undefined) {
            return token('mode', captives[4])
        } else if (captives[5] !== undefined) {
            return token('number', captives[5])
        } else if (captives[6] !== undefined) {
            const t = token('punc', captives[6])
            if (t.value === '\n') {
                line += 1
                col = 1
            }
            return t
        }
    }

    return function() {
        let t
        while (t === undefined) {
            t = scan()
        }
        return t
    }
}
