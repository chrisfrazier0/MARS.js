const state = function(coreSize) {
    const s = Object.create(state_original)
    s.core = new Array(coreSize)
    s.dirty = []
    s.queue = []
    s.index = 0
    return s
}

const state_original = {
    clear() {
        this.core = new Array(this.core.length)
        this.dirty = []
        this.queue = []
        this.index = 0
    },
}

export default function jMARS(opts = {}) {
    const defaults = {
        coreSize: 8000,
        minDistance: 100,
        instructionLimit: 100,
        threadLimit: 8000,
    }
    const j = Object.create(jMARS_original)
    j.opts = { ...defaults, ...opts }
    j.state = state(j.opts.coreSize)
    j.warriors = []
    return j
}

const jMARS_original = {
    clear() {
        this.state.clear()
        this.warriors = []
    },
}
