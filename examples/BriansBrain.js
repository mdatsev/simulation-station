import {CellularAutomata, Cell} from '/lib.js'

window.ca = new CellularAutomata(200, 200)

class On extends Cell {
    update()   { this.become(Dying) }
    getColor() { return '#ffffff' }
}

class Dying extends Cell {
    update()   { this.become(Off) }
    getColor() { return '#0000ff' }
}

class Off extends Cell {
    update(neighs) { 
        if(neighs.filter(c => c instanceof On).length == 2)
            this.become(On) 
    }
    getColor() { return '#000000' }
}

ca.runWithRandom([On, Off])
