import {simplex2d} from '../noisejs/noise.js'

import {Cell, CALayer, Simulation} from '../Simulation.js'

function terrain(x, y, noise, scale) {
    x /= scale
    y /= scale
    const f = (x, y) => (1 + noise(x, y)) / 2
    return (
           0.1  * f(70 * x, 70 * y) + 
           0.15 * f(10 * x, 10 * y) +
           0.75 * f(2 * x, 2  * y)
    )
}

class Terrain extends Cell {
    init() {
        const v = this.height = Math.floor(terrain(this.x, this.y, simplex2d, 200) * 255)
        this.color = `rgb(${v}, ${v}, ${v})`
        this.burning = 0
    }

    getColor() {
        return this.color
    }

    onClick() {
        this.burning = 1
    }
}

const terrainLayer = new CALayer(Terrain)

class Fire extends Cell {

    init() {
        this.burning = false
        this.burned = false
        this.counter = 0
    }

    getColor() {
        if(this.burning)
            return 'red'
        if(this.burned)
            return 'brown'
    }

    update() {
        if(this.burned) 
            return
        const heights = this.getMooreNeighbours(terrainLayer).map(h => h.height)
        const fires = this.getMooreNeighbours().map(f => f.burning)
        if(this.burning) {
            this.counter++
            if(this.counter > 10) {
                this.burning = false
                this.burned = true
            }
        } else {
            let chance = 0
            for(let i = 0; i < 8; i++) {
                if(fires[i]) {
                    const diff = this.on(terrainLayer).height - heights[i]
                    if(diff > 0)
                        chance += 1
                    else
                        chance += 1/15
                }
            }
            if(Math.random() < chance / 8) {
                this.burning = true
            }
        }
    }

    onClick() {
        this.burning = true
    }
}

const fireLayer = new CALayer(Fire)

const ca = window.ca = new Simulation(200, 200, [terrainLayer, fireLayer])
ca.resume()