import { WRITE, EXEC, mod } from '../util.js'

export default function exec(state, threadLimit) {
    if (state.queue.length === 0) {
        return
    }

    // Fetch
    const core = state.core
    const warrior = state.queue[state.index]
    const ip = warrior.tasks.shift()
    const ir = { ...core[ip] }

    // Decode
    let pa, pb, ira, irb, t
    const m = n => mod(n, core.length)
    const write = function(addr, ab, val) {
        core[addr][ab] = m(val)
        core[addr].id = warrior.id
        core[addr].status = WRITE
        state.dirty.add(addr)
    }

    switch (ir.ma) {
    case '#':
        pa = ip
        ira = { ...core[pa] }
        break
    case '$':
        pa = m(ip + ir.a)
        ira = { ...core[pa] }
        break
    case '*':
        pa = m(ip + ir.a)
        pa = m(core[pa].a + pa)
        ira = { ...core[pa] }
        break
    case '{':
        pa = m(ip + ir.a)
        write(pa, 'a', core[pa].a-1)
        pa = m(core[pa].a + pa)
        ira = { ...core[pa] }
        break
    case '}':
        t = m(ip + ir.a)
        pa = m(core[t].a + t)
        ira = { ...core[pa] }
        write(t, 'a', core[t].a+1)
        break
    case '@':
        pa = m(ip + ir.a)
        pa = m(core[pa].b + pa)
        ira = { ...core[pa] }
        break
    case '<':
        pa = m(ip + ir.a)
        write(pa, 'b', core[pa].b-1)
        pa = m(core[pa].b + pa)
        ira = { ...core[pa] }
        break
    case '>':
        t = m(ip + ir.a)
        pa = m(core[t].b + t)
        ira = { ...core[pa] }
        write(t, 'b', core[t].b+1)
        break
    }

    switch (ir.mb) {
    case '#':
        pb = ip
        irb = { ...core[pb] }
        break
    case '$':
        pb = m(ip + ir.b)
        irb = { ...core[pb] }
        break
    case '*':
        pb = m(ip + ir.b)
        pb = m(core[pb].a + pb)
        irb = { ...core[pb] }
        break
    case '{':
        pb = m(ip + ir.b)
        write(pb, 'a', core[pb].a-1)
        pb = m(core[pb].a + pb)
        irb = { ...core[pb] }
        break
    case '}':
        t = m(ip + ir.b)
        pb = m(core[t].a + t)
        irb = { ...core[pb] }
        write(t, 'a', core[t].a+1)
        break
    case '@':
        pb = m(ip + ir.b)
        pb = m(core[pb].b + pb)
        irb = { ...core[pb] }
        break
    case '<':
        pb = m(ip + ir.b)
        write(pb, 'b', core[pb].b-1)
        pb = m(core[pb].b + pb)
        irb = { ...core[pb] }
        break
    case '>':
        t = m(ip + ir.b)
        pb = m(core[t].b + t)
        irb = { ...core[pb] }
        write(t, 'b', core[t].b+1)
        break
    }

    // Execute
    let next = [m(ip+1)]
    const dest = pb
    const copy = function(src, dest) {
        core[dest].op = src.op
        core[dest].ma = src.ma
        core[dest].mb = src.mb
        core[dest].a = src.a
        core[dest].b = src.b
        core[dest].id = warrior.id
        core[dest].status = WRITE
        state.dirty.add(dest)
    }

    switch (ir.op) {
    case 'DAT.AB':
    case 'DAT.BA':
    case 'DAT.A':
    case 'DAT.B':
    case 'DAT.F':
    case 'DAT.X':
    case 'DAT.I':
        next = []
        break

    case 'MOV.AB':
        write(dest, 'b', ira.a)
        break
    case 'MOV.BA':
        write(dest, 'a', ira.b)
        break
    case 'MOV.A':
        write(dest, 'a', ira.a)
        break
    case 'MOV.B':
        write(dest, 'b', ira.b)
        break
    case 'MOV.F':
        write(dest, 'a', ira.a)
        write(dest, 'b', ira.b)
        break
    case 'MOV.X':
        write(dest, 'a', ira.b)
        write(dest, 'b', ira.a)
        break
    case 'MOV.I':
        copy(ira, dest)
        break

    case 'ADD.AB':
        write(dest, 'b', irb.b + ira.a)
        break
    case 'ADD.BA':
        write(dest, 'a', irb.a + ira.b)
        break
    case 'ADD.A':
        write(dest, 'a', irb.a + ira.a)
        break
    case 'ADD.B':
        write(dest, 'b', irb.b + ira.b)
        break
    case 'ADD.F':
    case 'ADD.I':
        write(dest, 'a', irb.a + ira.a)
        write(dest, 'b', irb.b + ira.b)
        break
    case 'ADD.X':
        write(dest, 'a', irb.a + ira.b)
        write(dest, 'b', irb.b + ira.a)
        break

    case 'SUB.AB':
        write(dest, 'b', irb.b - ira.a)
        break
    case 'SUB.BA':
        write(dest, 'a', irb.a - ira.b)
        break
    case 'SUB.A':
        write(dest, 'a', irb.a - ira.a)
        break
    case 'SUB.B':
        write(dest, 'b', irb.b - ira.b)
        break
    case 'SUB.F':
    case 'SUB.I':
        write(dest, 'a', irb.a - ira.a)
        write(dest, 'b', irb.b - ira.b)
        break
    case 'SUB.X':
        write(dest, 'a', irb.a - ira.b)
        write(dest, 'b', irb.b - ira.a)
        break

    case 'MUL.AB':
        write(dest, 'b', irb.b * ira.a)
        break
    case 'MUL.BA':
        write(dest, 'a', irb.a * ira.b)
        break
    case 'MUL.A':
        write(dest, 'a', irb.a * ira.a)
        break
    case 'MUL.B':
        write(dest, 'b', irb.b * ira.b)
        break
    case 'MUL.F':
    case 'MUL.I':
        write(dest, 'a', irb.a * ira.a)
        write(dest, 'b', irb.b * ira.b)
        break
    case 'MUL.X':
        write(dest, 'a', irb.a * ira.b)
        write(dest, 'b', irb.b * ira.a)
        break

    case 'DIV.AB':
        if (ira.a !== 0) {
            write(dest, 'b', irb.b / ira.a | 0)
        } else {
            next = []
        }
        break
    case 'DIV.BA':
        if (ira.b !== 0) {
            write(dest, 'a', irb.a / ira.b | 0)
        } else {
            next = []
        }
        break
    case 'DIV.A':
        if (ira.a !== 0) {
            write(dest, 'a', irb.a / ira.a | 0)
        } else {
            next = []
        }
        break
    case 'DIV.B':
        if (ira.b !== 0) {
            write(dest, 'b', irb.b / ira.b | 0)
        } else {
            next = []
        }
        break
    case 'DIV.F':
    case 'DIV.I':
        if (ira.a !== 0 && ira.b !== 0) {
            write(dest, 'a', irb.a / ira.a | 0)
            write(dest, 'b', irb.b / ira.b | 0)
        } else {
            next = []
        }
        break
    case 'DIV.X':
        if (ira.a !== 0 && ira.b !== 0) {
            write(dest, 'a', irb.a / ira.b | 0)
            write(dest, 'b', irb.b / ira.a | 0)
        } else {
            next = []
        }
        break

    case 'MOD.AB':
        if (ira.a !== 0) {
            write(dest, 'b', irb.b % ira.a)
        } else {
            next = []
        }
        break
    case 'MOD.BA':
        if (ira.b !== 0) {
            write(dest, 'a', irb.a % ira.b)
        } else {
            next = []
        }
        break
    case 'MOD.A':
        if (ira.a !== 0) {
            write(dest, 'a', irb.a % ira.a)
        } else {
            next = []
        }
        break
    case 'MOD.B':
        if (ira.b !== 0) {
            write(dest, 'b', irb.b % ira.b)
        } else {
            next = []
        }
        break
    case 'MOD.F':
    case 'MOD.I':
        if (ira.a !== 0 && ira.b !== 0) {
            write(dest, 'a', irb.a % ira.a)
            write(dest, 'b', irb.b % ira.b)
        } else {
            next = []
        }
        break
    case 'MOD.X':
        if (ira.a !== 0 && ira.b !== 0) {
            write(dest, 'a', irb.a % ira.b)
            write(dest, 'b', irb.b % ira.a)
        } else {
            next = []
        }
        break

    case 'JMP.AB':
    case 'JMP.BA':
    case 'JMP.A':
    case 'JMP.B':
    case 'JMP.F':
    case 'JMP.X':
    case 'JMP.I':
        next = [pa]
        break

    case 'JMZ.A':
    case 'JMZ.BA':
        if (irb.a === 0) {
            next = [pa]
        }
        break
    case 'JMZ.B':
    case 'JMZ.AB':
        if (irb.b === 0) {
            next = [pa]
        }
        break
    case 'JMZ.F':
    case 'JMZ.X':
    case 'JMZ.I':
        if (irb.a === 0 && irb.b === 0) {
            next = [pa]
        }
        break

    case 'JMN.A':
    case 'JMN.BA':
        if (irb.a !== 0) {
            next = [pa]
        }
        break
    case 'JMN.B':
    case 'JMN.AB':
        if (irb.b !== 0) {
            next = [pa]
        }
        break
    case 'JMN.F':
    case 'JMN.X':
    case 'JMN.I':
        if (irb.a !== 0 && irb.b !== 0) {
            next = [pa]
        }
        break

    case 'DJN.A':
    case 'DJN.BA':
        write(dest, 'a', core[dest].a-1)
        irb.a -= 1
        if (irb.a !== 0) {
            next = [pa]
        }
        break
    case 'DJN.B':
    case 'DJN.AB':
        write(dest, 'b', core[dest].b-1)
        irb.b -= 1
        if (irb.b !== 0) {
            next = [pa]
        }
        break
    case 'DJN.F':
    case 'DJN.X':
    case 'DJN.I':
        write(dest, 'a', core[dest].a-1)
        write(dest, 'b', core[dest].b-1)
        irb.a -= 1
        irb.b -= 1
        if (irb.a !== 0 && irb.b !== 0) {
            next = [pa]
        }
        break

    case 'SEQ.A':
        if (ira.a === irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SEQ.B':
        if (ira.b === irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SEQ.AB':
        if (ira.a === irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SEQ.BA':
        if (ira.b === irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SEQ.F':
        if (ira.a === irb.a && ira.b === irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SEQ.X':
        if (ira.a === irb.b && ira.b === irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SEQ.I':
        if (
            ira.op === irb.op &&
            ira.ma === irb.ma &&
            ira.mb === irb.mb &&
            ira.a === irb.a &&
            ira.b === irb.b
        ) {
            next = [m(ip+2)]
        }
        break

    case 'SNE.A':
        if (ira.a !== irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SNE.B':
        if (ira.b !== irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SNE.AB':
        if (ira.a !== irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SNE.BA':
        if (ira.b !== irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SNE.F':
        if (ira.a !== irb.a || ira.b !== irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SNE.X':
        if (ira.a !== irb.b || ira.b !== irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SNE.I':
        if (
            ira.op !== irb.op ||
            ira.ma !== irb.ma ||
            ira.mb !== irb.mb ||
            ira.a !== irb.a ||
            ira.b !== irb.b
        ) {
            next = [m(ip+2)]
        }
        break

    case 'SLT.A':
        if (ira.a < irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SLT.B':
        if (ira.b < irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SLT.AB':
        if (ira.a < irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SLT.BA':
        if (ira.b < irb.a) {
            next = [m(ip+2)]
        }
        break
    case 'SLT.F':
    case 'SLT.I':
        if (ira.a < irb.a && ira.b < irb.b) {
            next = [m(ip+2)]
        }
        break
    case 'SLT.X':
        if (ira.a < irb.b && ira.b < irb.a) {
            next = [m(ip+2)]
        }
        break

    case 'SPL.AB':
    case 'SPL.BA':
    case 'SPL.A':
    case 'SPL.B':
    case 'SPL.F':
    case 'SPL.X':
    case 'SPL.I':
        next = [m(ip+1), pa]
        break

    case 'NOP.AB':
    case 'NOP.BA':
    case 'NOP.A':
    case 'NOP.B':
    case 'NOP.F':
    case 'NOP.X':
    case 'NOP.I':
        // NO OPERATION
        break
    }

    // Update State
    if (next.length !== 0) {
        core[ip].status = EXEC
        state.dirty.add(ip)
        warrior.tasks = warrior.tasks.concat(next)
    }
    if (warrior.tasks.length === 0) {
        state.queue.splice(state.index, 1)
    } else {
        while (warrior.tasks.length > threadLimit) {
            warrior.tasks.pop()
        }
        state.index += 1
    }
    if (state.index >= state.queue.length) {
        state.index = 0
        state.cycles += 1
    }
}
