import {CellularAutomata, Cell} from '../CellularAutomata.js'
import {hueToRgb} from '../util.js'

const n = 20
const colors = [...Array(n).keys()].map(i => hueToRgb(i * (1 / n)))
class C extends Cell {
    init() {
        this.value = Math.floor(Math.random() * n)
    }
    update(neighs) {
        const c = neighs.find(c => c.value == (this.value + 1) % n)
        if(c)
            this.value = c.value
    }
    getColor() { return colors[this.value] }
}

const ca = new CellularAutomata(280, 140, C, {scale:4})

ca.resume()
