import {ABLayer, Simulation, Agent} from '../Simulation.js'

const ab = new ABLayer()
const srandom = () => (.5 - Math.random()) * 20
class Rabbit extends Agent {

    getColor() {
        return '#808080'
    }

    update() {
        const r = Math.random()
        if(r > .994)
        {
            this.spawn(Rabbit)
        }
        this.move(srandom(), srandom())
    }
}

class Fox extends Agent {

    init() {
        this.hunger = 0
    }

    getColor() {
        return '#ff0000'
    }

    update() {
        this.hunger++
        if(this.hunger > 100) {
            this.destroy(this)
        }
        this.neighsWithin(5, Rabbit).forEach(a => {
            this.destroy(a)
            if(Math.random() > .9)
                this.spawn(Fox)
            this.hunger = 0
        })
        this.move(srandom(), srandom())
    }
}

const sim = window.sim = new Simulation(600, 600, [ab])
ab.spreadRandom(Fox, 100)
ab.spreadRandom(Rabbit, 2000)
sim.resume()