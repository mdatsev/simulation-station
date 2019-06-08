import {ABLayer, Simulation, Agent} from '../Simulation.js'
import { createTimeControls } from '../UI.js'

const balls = new ABLayer()
const srandom = () => (.5 - Math.random()) * 4

class Ball extends Agent {
    getTexture() {
        return this.collided ? './ball2.png' : './ball.png'
    }
    init() {
        this.scale = 20
    }

    update() {
        this.collided = this.neighsWithin(20).length > 1
        this.move(srandom(), srandom())
    }
}

createTimeControls(new Simulation(1200, 600, balls, {init: s => {
    balls.spreadRandom(Ball, 1000)
    s.resume()
}}))

