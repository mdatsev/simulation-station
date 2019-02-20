import { Layer } from './CommonComponents.js'
import { random } from './util.js'

class ABLayer extends Layer {
    constructor() {
        super()
        this.init()
    }

    *getAgentsPartitioned() {
        if(this.agents.length > 0) {
            const done = []
            const types = [this.agents[0].constructor]
            while(types.length > 0) {
                const partition = []
                for(const a of this.agents) {
                    if(a.constructor == types[0]) {
                        partition.push(a)
                    } else if(!types.includes(a.constructor) && !done.includes(a.constructor)) {
                        types.push(a.constructor)
                    }
                }
                yield [partition, types[0]]
                done.push(types.shift())
            }
        }
    }

    init(xSize, ySize) {
        this.origin = {x: 0, y:0}
        this.scale = 1
        this.agents = []
        this.toSpawn = []
        this.toDestroy = []
        this.width = xSize
        this.height = ySize
    }

    spreadRandom(agent, n, startx = this.origin.x, starty = this.origin.y, endx = this.width * this.scale, endy = this.height * this.scale) {
        for(let i = 0; i < n; i++) {
            const x = random(startx, endx),
            y = random(starty, endy);
            const len = this.agents.push(new (agent)(x, y, this))
            this.agents[len - 1].init()
        }
    }

    spawn(agent, x, y) {
        this.toSpawn.push({agent, x, y})
    }

    destroy(agent) {
        for(let i = 0; i < this.agents.length; i++) {
            if(this.agents[i]._ssinternal.original == agent) {
                this.toDestroy.push(i)
            }
        }
    }

    prepareForUpdate() {
        this.old_agents = []
    
        for(let i = 0; i < this.agents.length; i++) {
            this.old_agents.push(Object.assign(new (this.agents[i].constructor)(), this.agents[i]))
            this.old_agents[i]._ssinternal.original = this.agents[i]
        }
    }

    tick() {
        for(let i = 0; i < this.agents.length; i++) {
            this.agents[i].update()
        }
        
        for(const a of this.toSpawn) {
            const new_ag = new (a.agent)(a.x, a.y, this)
            new_ag.init()
            this.agents.push(new_ag)
        }

        this.toSpawn = []

        this.toDestroy = [...new Set(this.toDestroy)]
        this.toDestroy.sort((a, b) => b - a)
        for(const i of this.toDestroy)
            this.agents.splice(i, 1)
        this.toDestroy = []
    }

    neighsWithin(agent, dist, type) {
        const neighs = []
        for(const a of this.agents) {
            const x = agent.x - a.x
            const y = agent.y - a.y
            const distSq = x * x + y * y
            if(distSq <= dist * dist && a instanceof type) {
                neighs.push(a)
            }
        }
        return neighs
    }
}

class Agent {
    constructor(x = 0, y = 0, ab = null) {
        this.x = x
        this.y = y
        this.ab = ab
        this._ssinternal = {}
    }
    move(x, y) {
        this.x += x
        this.y += y
        const w = this.ab.width
        const h = this.ab.height
        if(this.x >= w) this.x = this.x-w
        if(this.x < 0) this.x = w+this.x
        if(this.y >= h) this.y = this.y-h
        if(this.y < 0) this.y = h+this.y
    }
    spawn(agent, x = this.x, y = this.y) {
        this.ab.spawn(agent, x, y)
    }
    destroy(agent) {
        this.ab.destroy(agent)
    }
    neighsWithin(dist, type) {
        return this.ab.neighsWithin(this, dist, type)
    }
    on(layer) {
        return layer.cells[Math.floor(this.x)][Math.floor(this.y)] //todo adjust for scale
    }
    update() { }
    init() { }
    getColor() { return '#ff00ff' }
}

export {
    Agent,
    ABLayer
}