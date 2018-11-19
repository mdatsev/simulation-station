import {CellularAutomata, Cell} from '../CellularAutomata.js'

window.ca = new CellularAutomata(200, 200)

class Maze extends Cell {

    getColor() {
        return this.alive ? '#FFFFFF' : '#000000'
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n > 0 && n < 6 && this.alive
    }
}
ca.spreadRandomCells(Maze)

ca.forEachCell(c => c.alive = Math.random() > .5, 
    100, 100, 105, 105)

ca.run()