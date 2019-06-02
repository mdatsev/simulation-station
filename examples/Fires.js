import {simplex2d} from '../noisejs/noise.js'

import {Cell, CALayer, Simulation} from '../Simulation.js'

import {createPropertySlider} from '../UI.js'

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
        const v = this.height = terrain(this.x, this.y, simplex2d, 200)
        this.color = [v*110, v*255, 0]
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
        this.counter = 0
    }

    getColor() {
        if(this.burning)
            return [255, Math.random() * 255, 0, opacity]
        if(this.burned)
            return [30, 30, 30, opacity]
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

const ca = window.ca = new Simulation(300, 150, [terrainLayer, fireLayer], {scale:6})
createPropertySlider(window, 'opacity', 0, 255, 1, 255)
ca.resume()