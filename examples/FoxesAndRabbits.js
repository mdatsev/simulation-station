import {ABLayer, CALayer, Simulation, Agent, Cell} from '../Simulation.js'

const ab = new ABLayer()
const srandom = () => (.5 - Math.random()) * 4
class Rabbit extends Agent {

    init() {
        this.vx = srandom()
        this.vy = srandom()
    }

    static getTexture() {
        return '../rabbit.png'
    }

    update() {
        const r = Math.random()
        if(r > .99)
        {
            this.spawn(Rabbit)
        }
        this.move(this.vx, this.vy)
    }
}

class Fox extends Agent {

    init() {
        this.hunger = 0
        this.vx = srandom()
        this.vy = srandom()
    }

    static getTexture() {
        return '../fox.png'
    }

    update() {
        this.hunger++
        if(this.hunger > 100) {
            this.destroy(this)
        }
        this.neighsWithin(20, Rabbit).forEach(a => {
            this.destroy(a)
            if(Math.random() > .9)
                this.spawn(Fox)
            this.hunger = 0
        })
        this.move(this.vx, this.vy)
    }
}

const sim = window.sim = new Simulation(800, 800, ab)
ab.spreadRandom(Fox, 20)
ab.spreadRandom(Rabbit, 50)
sim.resume()