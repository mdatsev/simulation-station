import FrameCounter from './FrameCounter.js'
import { Layer } from './CommonComponents.js'
import { CALayer, Cell, EmptyCell } from './CAComponents.js'
import { ABLayer, Agent } from './ABComponents.js'
import { createCanvas } from './util.js'
import { WebGLRenderer } from './WebGLRenderer.js'

function chooseCanvas(nxCells, nyCells, canvas, scale) {
    if(!canvas && !scale)
        return createCanvas(nxCells, nyCells)
    if(!canvas && scale)
        return createCanvas(nxCells * scale, nyCells * scale)
    if(canvas instanceof HTMLCanvasElement)
        return canvas
    if(canvas.width && canvas.height)
        return createCanvas(canvas.width, canvas.height)
}

class Simulation {

    constructor(xsize, ysize, layers, options = {}) {
        let {
            canvas,
            scale
        } = options
        this.layers = layers = layers instanceof Layer ? [layers] : layers
        canvas = chooseCanvas(xsize, ysize, canvas, scale)
        canvas.addEventListener('click', ev => this.layers.forEach(l => {
            const [x, y] = this.renderer.clickToCanvasCoordinates(ev)
            l.onClick(x, y)
            this.renderer.draw()
        }))
        canvas.addEventListener('wheel', ev => this.renderer.onZoom(ev))
        for(const layer of layers) {
            layer.init(xsize, ysize, canvas)
        }
        this.renderer = new WebGLRenderer(this, canvas, xsize, ysize, { scale })
        this.frameCounter = new FrameCounter(100)
        this.renderer.draw() 
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