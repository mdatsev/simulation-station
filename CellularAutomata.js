import FrameCounter from './FrameCounter.js'
import CARenderer from './CARenderer.js'
import {random, createCanvas, clickToCanvasCoordinates} from './util.js'
import {CALayer, Simulation, Cell, EmptyCell} from './Simulation.js'

function chooseCanvas(nxCells, nyCells, canvas, enablePixelDrawing) {
    if(canvas instanceof HTMLCanvasElement)
        return canvas
    else if(canvas.width && canvas.height)
        return createCanvas(canvas.width, canvas.height)
    else if(typeof canvas == 'number')
        return createCanvas(nxCells * canvas, nyCells * canvas)
    else if(enablePixelDrawing)
        return createCanvas(nxCells, nyCells)
    else
        return createCanvas(nxCells * 4, nyCells * 4)
}


class CellularAutomata extends Simulation {
    constructor(nxCells, nyCells, cellTypes, canvas = {}, options = {}) {
        super(nxCells, nyCells, new CALayer(cellTypes), canvas)
    }
}

export {
    CellularAutomata,
    Cell,
    EmptyCell
}