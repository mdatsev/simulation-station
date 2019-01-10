import FrameCounter from './FrameCounter.js'
import CARenderer from './CARenderer.js'
import {random, createCanvas, clickToCanvasCoordinates} from './util.js'
import {CALayer, Simulation, Cell, EmptyCell} from './Simulation.js'

function CellularAutomata(nxCells, nyCells, cellTypes, options) {
    const layer = new CALayer(cellTypes)
    const sim = new Simulation(nxCells, nyCells, layer, options)
    return new Proxy({}, { get: (target, prop) => {
        const get = o => o[prop].bind(o)
        if(prop == 'layer') return layer
        if(prop == 'simulation') return sim
        if(prop in sim) return get(sim)
        if(prop in layer) return get(layer)
    }})
}

export {
    CellularAutomata,
    Cell,
    EmptyCell
}