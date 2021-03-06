import {CellularAutomata, Cell} from '../CellularAutomata.js'

class GoL extends Cell {

    init() {
        this.alive = Math.random() > .5
    }

    getColor() {
        return this.alive ? [255, 255, 255] : [0, 0, 0]
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n == 2 && this.alive
    }
}

const ca = new CellularAutomata(270, 140, GoL, {scale:4})

ca.resume()