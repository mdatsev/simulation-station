import {CellularAutomata, Cell} from '/lib.js'

window.ca = new CellularAutomata(200, 200, {width: 200, height: 200})

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
for(let i = 0; i < n; i++) {
    cell_types.push(class C extends Cell {
        constructor() {
            super()
            this.value = i
            const h = this.value * (1/n)
            this.color = `hsl(${h}, 100%, 50%)`
            this.rawColor = hueToRgb(h)
        }
        update(neighs) {
            if(neighs.filter(c => (c.value == this.value + 1) 
                        || (c.value == 0 && this.value == n - 1)).length > 0) {
                this.become(cell_types[(i+1)%n]) 
            }
        }
        getColorRaw() { return this.rawColor }
        getColor() { return this.color }
    })
}

ca.runWithRandom(cell_types)
