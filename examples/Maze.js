import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {createTimeControls} from '../UI.js'
class Maze extends Cell {

    random() {
        this.alive = Math.random() > .5
    }

    getColor() {
        return this.alive ? [255, 255, 255] : [0, 0, 0]
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n > 0 && n < 6 && this.alive
        // this.alive = n > 0 || this.alive
    }
}

const ca = new CellularAutomata(200, 200, Maze, {
    tick: s => {
        console.log(s.layers[0].cells.boundary)
    }
})

ca.spreadRandomCells(Maze, 
    100, 100, 105, 105)
ca.renderer.draw()
createTimeControls(ca)