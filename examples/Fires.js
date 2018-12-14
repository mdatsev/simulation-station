import {simplex2d} from '../noisejs/noise.js'

import {CellularAutomata, Cell} from '../CellularAutomata.js'

class Terrain extends Cell {
    init() {
        const v = Math.floor(simplex2d(this.x / 50, this.y / 50) * 255)
        this.color = `rgb(${v},${v}, ${v})`
    }

    getColor() {
        return this.color
    }
}

const ca = new CellularAutomata(200, 200)
ca.spreadRandomCells(Terrain)
