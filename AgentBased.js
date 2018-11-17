import FrameCounter from './FrameCounter.js'
import ABRenderer from './ABRenderer.js'
import {random, createCanvas} from './util.js'

function chooseCanvas(origin, scale, canvas) {
    if(canvas instanceof HTMLCanvasElement)
        return canvas
    else if(canvas.width && canvas.height)
        return createCanvas(canvas.width, canvas.height)
    else
        return createCanvas(600, 600)
}


class AgentBased {
    constructor(origin = {x: 0, y: 0}, scale = 1, canvas = {}) {
        canvas = chooseCanvas(origin, scale, canvas)
        this.width = canvas.width
        this.height = canvas.height
        this.origin = origin
        this.scale = scale
        this.frameCounter = new FrameCounter(100)
        this.renderer = new ABRenderer(this, canvas)
        this.agents = []
        this.toSpawn = []
        this.toDestroy = []
    }

    spreadRandom(agent, n, startx = this.origin.x, starty = this.origin.y, endx = this.width * this.scale, endy = this.height * this.scale) {
        for(let i = 0; i < n; i++) {
            const len = this.agents.push(new (agent)(random(startx, endx), random(starty, endy), this))
            this.agents[len - 1].init()
        }
    }

    run() {
        this.startLoop()
    }

    startLoop() {
        this.tick()
        requestAnimationFrame(this.startLoop.bind(this))
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

    tick() {
        this.renderer.draw()

        this.old_agents = []
    
        for(let i = 0; i < this.agents.length; i++) {
            this.old_agents.push(Object.assign(new (this.agents[i].constructor)(), this.agents[i]))
            this.old_agents[i]._ssinternal.original = this.agents[i]
        }

        for(let i = 0; i < this.agents.length; i++) {
            this.agents[i].update()
        }
        
        for(const a of this.toSpawn) {
            this.agents.push(new (a.agent)(a.x, a.y, this))
        }

        for(const a of this.toSpawn) {
            this.agents.push(new (a.agent)(a.x, a.y, this))
        }
        this.toSpawn = []

        this.toDestroy = [...new Set(this.toDestroy)]
        this.toDestroy.sort((a, b) => b - a)
        for(const i of this.toDestroy)
            this.agents.splice(i, 1)
        this.toDestroy = []
        this.frameCounter.update()
        //console.log(this.frameCounter.getFramerate())
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
    update() { }
    init() { }
    getColor() { return '#ff00ff' }
}

export {
    AgentBased,
    Agent
}