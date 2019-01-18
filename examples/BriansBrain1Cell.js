import {CellularAutomata, Cell} from '../CellularAutomata.js'

class Neuron extends Cell {

    random() {
        this.state = Math.random() > .5 ? 'on' : 'off'
    }

    getColor() {
        return this.state == 'on' 
                                ? [255, 255, 255] 
                                : this.state == 'off' 
                                    ? [0, 0, 0]
                                    : [0, 0, 255]
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

const ca = new CellularAutomata(200, 200, Neuron)

ca.resume()