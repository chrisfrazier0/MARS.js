import jMARS from './lib/jmars.js'
import lexer from './lib/lexer.js'
import parse from './lib/parser.js'

window.mars = jMARS()
window.lex = lexer('JMP 0, #0 ; jump somewhere\nDAT $1, $5\n')
window.parse = parse
