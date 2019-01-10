import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {hueToRgb} from '../util.js'

const cell_types = []
const n = 16
const colors = [...Array(n).keys()].map(i => `hsl(${i / n * 360},100%,50%)`) //hueToRgb(i * (1 / n)))
class C extends Cell {
    init() {
        this.value = Math.floor(Math.random() * n)
    }
    update(neighs) {
        const c = neighs.find(c => c.value == (this.value + 1) % n)
        if(c)
            this.value = c.value
    }
    // getColorRaw() { return colors[this.value] }
    getColor() { return colors[this.value] }
}

const ca = new CellularAutomata(200, 200, C)

ca.resume()
