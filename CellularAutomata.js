import {CALayer, Cell, EmptyCell} from './Simulation.js'
import SLS from './SingleLayerSimulation.js'

const CellularAutomata = SLS(CALayer)

export {
    CellularAutomata,
    Cell,
    EmptyCell
}