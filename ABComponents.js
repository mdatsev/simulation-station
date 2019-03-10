import { Layer } from './CommonComponents.js'
import { random } from './util.js'
import {AgentContainer, QuadTree, Rectangle} from './AgentContainer.js'
import * as mat4 from './gl-matrix/mat4';


class ABLayer extends Layer {
    constructor() {
        super()
        this.init()
    }

    *getAgentsPartitionedByTexure() {
        // if(this.agents.length > 0) {
        //     const done = []
        //     const types = [this.agents[0].constructor]
        //     while(types.length > 0) {
        //         const partition = []
        //         for(const a of this.agents) {
        //             if(a.constructor == types[0]) {
        //                 partition.push(a)
        //             } else if(!types.includes(a.constructor) && !done.includes(a.constructor)) {
        //                 types.push(a.constructor)
        //             }
        //         }
        //         yield [partition, types[0].getTexture()]
        //         done.push(types.shift())
        //     }
        // }
        for(const agent of this.agents) {
            yield [[agent], (agent.constructor.getTexture || agent.getTexture).call(agent)]
        }
        // for(const agent of this.agents) {
        //     yield [[agent], agent.getTexture()]
        // }
        // yield [this.agents, './fox.png']
    }

    init(xSize, ySize) {
        this.origin = {x: 0, y:0}
        this.scale = 1
        this.agents = new AgentContainer()
        this.toSpawn = []
        this.toDestroy = []
        this.width = xSize
        this.height = ySize
    }

    spreadRandom(type, n, startx = this.origin.x, starty = this.origin.y, endx = this.width * this.scale, endy = this.height * this.scale) {
        for(let i = 0; i < n; i++) {
            const x = random(startx, endx)
            const y = random(starty, endy)
            const agent = new (type)(x, y, this)
            agent.init()
            this.agents.push(agent)
        }
    }

    spawn(agent, x, y) {
        this.toSpawn.push({agent, x, y})
    }

    destroy(agent) { // TODO
        for(let i = 0; i < this.agents.length; i++) {
            if(this.agents[i]._ssinternal.original == agent) {
                this.toDestroy.push(i)
            }
        }
    }

    prepareForUpdate() {
        this.old_agents = this.agents.copy()
        this.qtree = new QuadTree(new Rectangle(200, 200, 1, 1), 4)
        for(const a of this.old_agents) {
            this.qtree = this.qtree.insert(a)
        }
    }

    tick() {
        for(const agent of this.agents) {
            agent.update()
        }
        
        for(const a of this.toSpawn) {
            const new_ag = new (a.agent)(a.x, a.y, this)
            new_ag.init()
            this.agents.push(new_ag)
        }

        this.toSpawn = []

        // this.toDestroy = [...new Set(this.toDestroy)]
        // this.toDestroy.sort((a, b) => b - a)
        // for(const i of this.toDestroy)
        //     this.agents.splice(i, 1) //TODO
        this.toDestroy = []
    }

    neighsWithin(agent, dist, type) {
        const neighs = this.qtree.getInCircle(agent.x, agent.y, dist)
        return neighs
    }
}

function getXY([first, ...args]) {
    if(typeof first === 'number')
        return [first, ...args]
    if(Array.isArray(first))
        return [...first, ...args]
    if('x' in first)
        return [first.x, first.y, ...args]
    throw new Error('unsuppored coord args', first, args)
}
  

class Agent {
    constructor(x = 0, y = 0, ab = null) {
        this.x = x
        this.y = y
        this.ab = ab
        this._ssinternal = {}
        this.transform = mat4.create()
        mat4.identity(this.transform)
        this.scale = 1
    }
    
    move(...args) {
        const [x, y] = getXY(args)
        this.moveTo(this.x + x, this.y + y)
    }
    moveToward(...args) {
        const [x, y, fraction] = getXY(args)
        this.move((x - this.x) * fraction, (y - this.y) * fraction)
    }
    moveTo(...args) {
        let [x, y] = getXY(args)
        const w = this.ab.width
        const h = this.ab.height
        if(x >= w) x = x-w
        if(x < 0) x = w+x
        if(y >= h) y = y-h
        if(y < 0) y = h+y
        this.x = x
        this.y = y
        this.updateTransform()
    }

    updateTransform() {
        mat4.fromTranslation(this.transform, [this.x, this.y, 0])
        mat4.scale(this.transform, this.transform, [this.scale, this.scale, 0])
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
        return layer.cells.get(Math.floor(this.x), Math.floor(this.y)) //todo adjust for scale
    }
    update() { }
    init() { }
    getColor() { return '#ff00ff' }
}

export {
    Agent,
    ABLayer
}