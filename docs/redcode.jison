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
\n              return 'NEWLINE'
'.'             return '.'
','             return ','
':'             return ':'
'('             return '('
')'             return ')'
'+'             return '+'
'-'             return '-'
'*'             return '*'
'/'             return '/'
'%'             return '%'
<<EOF>>         return 'EOF'
.               throw  'INVALID'

/lex

%ebnf
%start redcode
%left + -
%left * / %
%%

redcode: (statement eol)* ;
eol: NEWLINE | EOF ;

statement
    : ORG expr
    | END expr?
    | label? instruction? ;

label: (LABEL | MODIFIER) ':'? ;
instruction: OPCODE ('.' MODIFIER)? ref (',' ref)? ;
ref: (MODE | '*')? expr ;

expr
    : '-'? primary
    | expr operator expr ;
primary
    : NUMBER
    | LABEL
    | MODIFIER
    | '(' expr ')' ;
operator
    : '+' | '-' | '*' | '/' | '%' ;
