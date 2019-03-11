%lex
%options ignore_case
%%

[\x20\t\r\f\v]+     /* skip whitespace */
';'[^\n]*           /* skip comments */

('DAT'|'MOV'|'ADD'|'SUB'|'MUL'|'DIV'|
 'MOD'|'JMP'|'JMZ'|'JMN'|'DJN'|'CMP'|
 'SEQ'|'SNE'|'SLT'|'SPL'|'NOP')        return 'OPCODE'
 'ORG'                                 return 'ORG'
 'END'                                 return 'END'
('AB'|'BA'|'A'|'B'|'F'|'X'|'I')        return 'MODIFIER'
('#'|'$'|'@'|'{'|'}'|'<'|'>')          return 'MODE'

[a-zA-Z_]\w*    return 'LABEL'
\d+             return 'NUMBER'

\n     return 'NEWLINE'
'.'    return '.'
','    return ','
':'    return ':'
'('    return '('
')'    return ')'
'+'    return '+'
'-'    return '-'
'*'    return '*'
'/'    return '/'
'%'    return '%'
.      throw  'INVALID'

/lex

%ebnf
%start redcode
%%

redcode: line+ ;
line: label? instruction? (NEWLINE | EOF) ;

label: (LABEL | MODIFIER) ':'? ;

instruction
    : ORG expr
    | END expr?
    | OPCODE ('.' MODIFIER)? ref (',' ref)? ;

ref: (MODE | '*')? expr ;

expr
    : term
    | expr ('+' | '-') term ;

term
    : unary
    | term ('*' | '/' | '%') unary ;

unary: '-'? primary ;

primary
    : NUMBER
    | LABEL
    | MODIFIER
    | '(' expr ')' ;
