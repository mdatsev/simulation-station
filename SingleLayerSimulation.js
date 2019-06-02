import {Simulation} from './Simulation.js'

export default function(layerType) {
    return function CellularAutomata(nxCells, nyCells, cellTypes, simulation_options, layer_options) {
        const layer = new layerType(cellTypes, layer_options)
        const sim = new Simulation(nxCells, nyCells, layer, simulation_options)
        return new Proxy({}, { get: (target, prop) => {
            const get = o => (o[prop] instanceof Function) ? o[prop].bind(o) : o[prop]
            if(prop == 'layer') return layer
            if(prop == 'simulation') return sim
            if(prop in sim) return get(sim)
            if(prop in layer) return get(layer)
        }})
    }
}