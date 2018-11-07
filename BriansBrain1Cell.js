import {CellularAutomata} from '/lib.js'

window.ca = new CellularAutomata(200, 200)

class Cell {

    random() {
        this.state = Math.random() > .5 ? 'on' : 'off'
    }

    getColor() {
        return this.state == 'on' 
                                ? '#FFFFFF' 
                                : this.state == 'off' 
                                    ? '#000000'
                                    : '#0000ff'
    }

    update(neighs) {
        const n = neighs.filter(c => c.state == 'on').length
        const s = this.state
        this.state = 
                s == 'off' && n == 2  ? 'on' : 
                s == 'on'             ? 'dying' : 
                s == 'dying'          ? 'off' : 
                    s
        this.alive = this.alive
    }
}
ca.runWithRandom(Cell)