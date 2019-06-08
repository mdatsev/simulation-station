import {CellularAutomata, Cell} from '../CellularAutomata.js'

class Neuron extends Cell {

    init() {
        this.state = Math.random() > .5 ? 'alive' : 'dead'
    }

    getColor() {
        return this.state == 'alive' 
                                ? [255, 255, 255] 
                                : this.state == 'dead' 
                                    ? [0, 0, 0]
                                    : [0, 0, 255]
    }

    update(neighs) {
        const n = neighs.filter(c => c.state == 'alive').length
        const s = this.state
        this.state = 
                s == 'dead' && n == 2  ? 'alive' : 
                s == 'alive'           ? 'dying' : 
                s == 'dying'           ? 'dead' : 
                    s
        this.alive = this.alive
    }
}

const ca = new CellularAutomata(280, 140, Neuron, {scale:4})

ca.resume()