import {CellularAutomata} from '/lib.js'

window.ca = new CellularAutomata(200, 200)

class Cell {

    constructor({alive = Math.random() > .5} = {}) {
        this.alive = alive
    }

    getColor() {
        return this.alive ? '#FFFFFF' : '#000000'
    }

    update(neighs) {
        const n = neighs.filter(c => c.alive).length
        this.alive = n == 3 || n == 2 && this.alive
    }
}
ca.runWith(Cell)