const make_regexp = function(str, fl) {
    return new RegExp(str.replace(/\s/g, ''), fl)
}

export default function lexer(str) {
    // Capture Groups
    // [1] Whitespace
    // [2] Comment
    // [3] Identifier
    // [4] Number
    // [5] Punctuation
    const rx_token = make_regexp(String.raw`
        ( [\x20 \t \r \f \v]+ )
    |   ( ; [^\n]* )
    |   ( [a-z A-Z _] \w* )
    |   ( \d+ )
    |   ( [\n # $ @ { } < > . , : ( ) + \- * / %] )
    `, 'y')

    let line = 1, col = 1
    const token = function(type, value) {
        const t = { type, value, line, col }
        col += value.length
        return t
    }

    const scan = function() {
        if (rx_token.lastIndex >= str.length) {
            return { type: 'EOF', value: 'EOF', line, col }
        }
        const captives = rx_token.exec(str)
        if (captives === null) {
            throw new SyntaxError(`Unexpected character at ${line}:${col}`)
        } else if (captives[3] !== undefined) {
            return token('IDENT', captives[3])
        } else if (captives[4] !== undefined) {
            return token('NUMBER', captives[4])
        } else if (captives[5] !== undefined) {
            const t = token('PUNC', captives[5])
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
