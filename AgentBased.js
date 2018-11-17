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
    }

    spreadRandom(agent, n, startx = this.origin.x, starty = this.origin.y, endx = this.width * this.scale, endy = this.height * this.scale) {
        for(let i = 0; i < n; i++) {
            this.agents.push(new (agent)(random(startx, endx), random(starty, endy)))
        }
    }

    run() {
        this.startLoop()
    }

    startLoop() {
        this.tick()
        requestAnimationFrame(this.startLoop.bind(this))
    }

    tick() {
        this.renderer.draw()

        this.old_agents = []
    
        for(let i = 0; i < this.agents.length; i++) {
            this.old_agents.push(Object.assign(new (this.agents[i].constructor)(), this.agents[i]))
        }

        for(let i = 0; i < this.agents.length; i++) {
            this.agents[i].update()
        }

        this.frameCounter.update()
        console.log(this.frameCounter.getFramerate())
    }
}

class Agent {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    move(x, y) {
        this.x += x
        this.y += y
    }
    update() { }
    getColor() { return '#ff00ff' }
}

export {
    AgentBased,
    Agent
}