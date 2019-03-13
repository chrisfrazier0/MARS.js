import parse from './parser.js'

const fDefault = ['DAT', 'NOP']
const bDefault = ['JMP', 'JMZ', 'JMN', 'DJN', 'SPL']
const iFinal = ['MOV', 'CMP', 'SEQ', 'SNE']
const fFinal = ['ADD', 'SUB', 'MUL', 'DIV', 'MOD']

export default function compile(src) {
    let [org, labels, instructions] = parse(src)
    let d, i = 0

    const evaluate = function(expr) {
        switch (expr.type) {
            case 'number':
                return Number(expr.value)
            case 'label':
            case 'modifier':
                d = labels.get(expr.value)
                if (d === undefined) {
                    throw new SyntaxError(`Unknow label "${expr.value}" at ${expr.line}:${expr.col}`)
                }
                return d - i
            case '+':
                return evaluate(expr.first) + evaluate(expr.second)
            case '-':
                return expr.second === undefined
                    ? -evaluate(expr.first)
                    : evaluate(expr.first) - evaluate(expr.second)
            case '*':
                return evaluate(expr.first) * evaluate(expr.second)
            case '/':
                return evaluate(expr.first) / evaluate(expr.second)
            case '%':
                return evaluate(expr.first) % evaluate(expr.second)
            default:
                throw new SyntaxError(`Unexpected symbol "${expr.type}:${expr.value}" at ${expr.line}:${expr.col}`)
        }
    }

    org = evaluate(org)
    const out = []
    for (; i < instructions.length; i++) {
        const inst = instructions[i]
        const op = inst.value.toUpperCase()
        let mod = (inst.modifier && inst.modifier.toUpperCase()) || '?'

        if (mod === '?') {
            if (fDefault.indexOf(op) !== -1) {
                mod = 'F'
            } else if (bDefault.indexOf(op) !== -1) {
                mod = 'B'
            } else if (inst.a.mode === '#') {
                mod = 'AB'
            } else if (inst.b.mode === '#') {
                mod = 'B'
            } else if (iFinal.indexOf(op) !== -1) {
                mod = 'I'
            } else if (fFinal.indexOf(op) !== -1) {
                mod = 'F'
            } else {
                mod = 'B' // SLT
            }
        }

        out.push({
            op: op + '.' + mod,
            ma: inst.a.mode,
            mb: inst.b.mode,
            a: evaluate(inst.a.value),
            b: evaluate(inst.b.value),
        })
    }

    return [org, out]
}
