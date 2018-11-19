import {CellularAutomata, Cell} from '../CellularAutomata.js'

window.ca = new CellularAutomata(200, 200, {}, {enablePixelDrawing: true})

function hueToRgb(h) {
    const mod = (number, limit) => (number < 0 ? number + limit : number % limit)
    const h2rgb = (initT) => {
        const t = mod(initT, 1)
    
        if (t < 1 / 6) {
            return 6 * t
        }
        if (t < 1 / 2) {
            return 1
        }
        if (t < 2 / 3) {
            return ((2 / 3) - t) * 6
        }
    
        return 0
    }
    
    const r = h2rgb(h + (1 / 3))
    const g = h2rgb(h)
    const b = h2rgb(h - (1 / 3))
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}


const cell_types = []
const n = 16
const colors = [...Array(n).keys()].map(i => hueToRgb(i * (1 / n)))
class C extends Cell {
    constructor() {
        super()
    }
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
