import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {createTimeControls} from '../UI.js'

class GoL extends Cell {

    init() {
        this.alive = this.x == 1 || this.y == 10 || Math.random() > .9
    }

    getColor() {
        return this.alive ? [255, 255, 255] : [0, 0, 0]
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n == 2 && this.alive
    }

    onClick() {
        console.log(this.x, this.y)
        this.alive ^= true
    }
}

const ca = window.ca = new CellularAutomata(50, 50, GoL, {scale:4})
ca.simulation.renderer.draw()
createTimeControls(ca)