import FrameCounter from './FrameCounter.js'
import { Layer } from './CommonComponents.js'
import { CALayer, Cell, EmptyCell } from './CAComponents.js'
import { ABLayer, Agent } from './ABComponents.js'
import { createCanvas } from './util.js'
import { WebGLRenderer } from './WebGLRenderer.js'

function chooseCanvas(nxCells, nyCells, canvas) {
    if(canvas instanceof HTMLCanvasElement)
        return canvas
    else if(canvas.width && canvas.height)
        return createCanvas(canvas.width, canvas.height)
    else if(typeof canvas == 'number')
        return createCanvas(nxCells * canvas, nyCells * canvas)
    else
        return createCanvas(nxCells, nyCells)
}

class Simulation {

    constructor(xsize, ysize, layers, canvas = {}) {
        this.layers = layers = layers instanceof Layer ? [layers] : layers
        canvas = chooseCanvas(xsize, ysize, canvas)
        for(const layer of layers) {
            layer.init(xsize, ysize, canvas)
        }
        this.renderer = new WebGLRenderer(this, canvas, xsize, ysize)
        this.frameCounter = new FrameCounter(100)
        this.transform = 
        this.running = false
        this.startLoop()
    }

    startLoop() {
        if(this.running)
            this.tick()
        requestAnimationFrame(() => this.startLoop())
    }

    tick() {
        for(const layer of this.layers) {
            layer.tick()
        }
        this.renderer.draw()
        this.frameCounter.update()
        console.log(this.frameCounter.getFramerate())
    }

    pause() {
        this.running = false
    }

    resume() {
        this.running = true
    }
}

export {
    Simulation,
    ABLayer,
    CALayer,
    Agent,
    Cell,
    EmptyCell
}