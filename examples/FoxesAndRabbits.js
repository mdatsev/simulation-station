import {AgentBased, Agent} from '/AgentBased.js'

window.ab = new AgentBased()

const srandom = () => (.5 - Math.random()) * 10

class Rabbit extends Agent {

    getColor() {
        return '#808080'
    }

    update() {
        // if(Math.random() > .7)
        //     this.spawn(Rabbit)
        this.move(srandom(), srandom())
    }
}

class Fox extends Agent {

    getColor() {
        return '#ff0000'
    }

    update() {
        // this.neighsWithin(5, Rabbit).forEach(a => {
        //     this.destroy(a)
        //     if(Math.random() > .7)
        //         this.spawn(Fox)
        // })
        this.move(srandom(), srandom())
    }
}

ab.spreadRandom(Fox, 10)
ab.spreadRandom(Rabbit, 10)
ab.run()