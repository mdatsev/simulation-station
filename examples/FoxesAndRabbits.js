import {AgentBased, Agent} from '/AgentBased.js'

window.ab = new AgentBased()
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
        if(this.hunger > 4) {
            this.destroy(this)
        }
        this.neighsWithin(10, Rabbit).forEach(a => {
            this.destroy(a)
            if(Math.random() > .9)
                this.spawn(Fox)
            this.hunger = 0
        })
        this.move(srandom(), srandom())
    }
}

ab.spreadRandom(Fox, 10)
ab.spreadRandom(Rabbit, 2000)
ab.run()