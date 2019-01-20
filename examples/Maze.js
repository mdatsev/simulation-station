import {CellularAutomata, Cell} from '../CellularAutomata.js'

class Maze extends Cell {
    getColor() {
        return this.alive ? [255, 255, 255] : [0, 0, 0]
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n > 0 && n < 6 && this.alive
    }
}

const ca = new CellularAutomata(200, 200, Maze)

ca.forEachCell(c => c.alive = Math.random() > .5, 
    100, 100, 105, 105)

ca.resume()