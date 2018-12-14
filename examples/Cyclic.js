import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {hueToRgb} from '../util.js'

window.ca = new CellularAutomata(200, 200, {}, {enablePixelDrawing: true})

const cell_types = []
const n = 16
const colors = [...Array(n).keys()].map(i => hueToRgb(i * (1 / n)))
class C extends Cell {
    random() {
        this.value = Math.floor(Math.random() * n)
    }
    update(neighs) {
        const c = neighs.find(c => c.value == (this.value + 1) % n)
        if(c)
            this.value = c.value
    }
    getColorRaw() { return colors[this.value] }
}
ca.runWithRandom(C)
