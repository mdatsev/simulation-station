import {CellularAutomata, Cell} from '../CellularAutomata.js'

class Alive extends Cell {
    update()   { this.become(Dying) }
    getColor() { return [255, 255, 255] }
}

class Dying extends Cell {
    update()   { this.become(Dead) }
    getColor() { return [0, 0, 255] }
}

class Dead extends Cell {
    update(neighs) { 
        if(neighs.filter(c => c instanceof Alive).length == 2)
            this.become(Alive) 
    }
    getColor() { return [0, 0, 0] }
}

const ca = new CellularAutomata(280, 140, [Alive, Dead], {scale:4})

ca.resume()