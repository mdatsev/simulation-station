import {simplex2d} from '../noisejs/noise.js'

import {CellularAutomata, Cell} from '../CellularAutomata.js'

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
let min_time, max_time
class Terrain extends Cell {
    init() {
        const v = this.height = Math.floor(terrain(this.x, this.y, simplex2d, 200) * 255)
        this.color = `rgb(${v}, ${v}, ${v})`
        this.burning = 0
    }

    getColor() {
        if(this.burning == 0)
            return this.color
        else if(this.burning > 0)
            return 'brown'
        else
            return 'black'//`hsl(${map(this.time, min_time, max_time, 0, 360 * 5)}, 100%, 50%)`
    }

    onClick() {
        this.burning = 1
    }

    update(neighs) {
        if(this.burning == 0) {
            let chance = 0
            for(const n of neighs) {
                if(n.burning > 0) {
                    const diff = this.height - n.height
                    if(diff > 0)
                        chance += 1
                    else
                        chance += 1/15
                }
            }
            if(Math.random() < chance / 8) {
                this.burning++
            }
        } else if(this.burning > 0) {
            this.burning++
            if(this.burning > 10) {
                this.burning = -1
                this.time = Date.now()
                if(!min_time)
                    min_time = this.time
                max_time = this.time
            }
        }
    }
}

const ca = new CellularAutomata(200, 200)
ca.spreadRandomCells(Terrain)
ca.resume()