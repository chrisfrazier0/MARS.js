import jMARS from './lib/jmars.js'
import lexer from './lib/lexer.js'

window.mars = jMARS()
window.lex = lexer('JMP 0, #0 ; jump somewhere\nDAT $1, $5\n')
