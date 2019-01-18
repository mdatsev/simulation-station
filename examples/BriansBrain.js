import {CellularAutomata, Cell} from '../CellularAutomata.js'

class On extends Cell {
    update()   { this.become(Dying) }
    getColor() { return [255, 255, 255] }
}

class Dying extends Cell {
    update()   { this.become(Off) }
    getColor() { return [0, 0, 255] }
}

class Off extends Cell {
    update(neighs) { 
        if(neighs.filter(c => c instanceof On).length == 2)
            this.become(On) 
    }
    getColor() { return [0, 0, 0] }
}

const ca = new CellularAutomata(200, 200, [On, Off])

ca.resume()