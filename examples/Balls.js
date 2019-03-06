import {ABLayer, CALayer, Simulation, Agent, Cell} from '../Simulation.js'
import { createTimeControls, createPropertyControl } from '../UI.js'

const params = {
    rabbitChance: .99,
    foxChance: .9,
    foxHunger: 100,
    distanceToEat: 20
}

const balls = new ABLayer()
const srandom = () => (.5 - Math.random()) * 4

class Ball extends Agent {
    getTexture() {
        return this.collided ? './ball2.png' : './ball.png'
    }
    init() {
        this.scale = 100
    }

    update() {
        this.collided = this.neighsWithin(100).length > 1
        this.move(srandom(), srandom())
    }
}

createTimeControls(new Simulation(800, 800, balls, {init: s => {
    balls.spreadRandom(Ball, 20)
    s.renderer.draw()
    s.resume()
}}))

createPropertyControl(params, 'rabbitChance')
createPropertyControl(params, 'foxChance')
createPropertyControl(params, 'foxHunger')
createPropertyControl(params, 'distanceToEat')

