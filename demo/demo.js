import jMARS from './lib/jmars.js'

const CHANG = `
    ;redcode-94nop
    ;name CHANG1
    ;author Morrison J. Chang

    jmp 4
    mov 2, -1
    jmp -1
    dat 9
    spl -2
    spl 4
    add #-16, -3
    mov -4, @-4
    jmp -4
    spl 2
    jmp -1
    mov 0, 1`

const MICE = `
    ;redcode-94nop
    ;name MICE
    ;author Chip Wendell

    jmp 2
    dat 0
    mov #12, -1
    mov @-2, <5
    djn -1, -3
    spl @3
    add #653, 2
    jmz -5, -6
    dat 833`

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
document.getElementById('demo').appendChild(canvas)
canvas.width = 798
canvas.height = 497
ctx.lineWidth = 1
ctx.fillStyle = '#111111'
ctx.fillRect(0, 0, 798, 497)

const mars = jMARS()
mars.load('CHANG1', CHANG)
mars.load('MICE', MICE)
mars.stageAll()

const render = function() {
    mars.state.dirty.forEach(addr => {
        const cell = mars.state.core[addr]
        let x = (addr % 114) * 7
        let y = (addr / 114 | 0) * 7
        if (cell.id === 0) {
            ctx.fillStyle = '#EB5757'
            ctx.strokeStyle = '#EB5757'
        } else {
            ctx.fillStyle = '#56CCF2'
            ctx.strokeStyle = '#56CCF2'
        }
        if (cell.status === jMARS.WRITE) {
            ctx.fillStyle = '#111111'
            ctx.fillRect(x, y, 7, 7)
            x += 1
            y += 1
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x+5, y+5)
            ctx.moveTo(x, y+5)
            ctx.lineTo(x+5,y)
            ctx.stroke()
            ctx.closePath()
        } else if (cell.status === jMARS.EXEC) {
            ctx.fillRect(x, y, 7, 7)
        }
        mars.state.dirty.delete(addr)
    })
    if (mars.state.queue.length > 0) {
        const next = mars.state.queue[mars.state.index].tasks[0]
        let x = (next % 114) * 7
        let y = (next / 114 | 0) * 7
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(x, y, 7, 7)
        mars.state.dirty.add(next)
    }
}

render()
;(function loop() {
    let n = 50
    while (n > 0 && mars.state.queue.length > 1) {
        mars.cycle()
        n -= 1
    }
    render()
    if (mars.state.queue.length > 1) {
        requestAnimationFrame(loop)
    }
})()

window.mars = mars
