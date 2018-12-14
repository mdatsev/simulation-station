import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {createCAControls} from '../UI.js'
const ca = new CellularAutomata(50, 50, 10)

class GoL extends Cell {

    random() {
        this.alive = Math.random() > .5
    }

    getColor() {
        return this.alive ? '#FFFFFF' : '#000000'
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n == 2 && this.alive
    }

    onClick() {
        this.alive ^= true
    }
}
ca.spreadRandomCells(GoL, false)
createCAControls(ca)