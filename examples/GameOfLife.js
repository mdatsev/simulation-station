import {CellularAutomata, Cell} from '../CellularAutomata.js'

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
}

window.ca = new CellularAutomata(200, 200, GoL)

ca.resume()