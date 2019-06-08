import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {createTimeControls} from '../UI.js'

class GoL extends Cell {

    getColor() {
        return this.alive ? [255, 255, 255] : [0, 0, 0]
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n == 2 && this.alive
    }

    onClick() {
        this.alive ^= true
    }
}

const ca = new CellularAutomata(50, 50, GoL, {scale:10})
createTimeControls(ca)