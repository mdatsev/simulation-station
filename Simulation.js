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
            scale,
            init
        } = options
        this.initFunction = init
        this.layers = layers = layers instanceof Layer ? [layers] : layers
        this.xsize = xsize
        this.ysize = ysize
        canvas = chooseCanvas(xsize, ysize, canvas, scale)
        console.log(canvas)
        canvas.addEventListener('click', ev => this.layers.forEach(l => {
            const [x, y] = this.renderer.clickToCanvasCoordinates(ev)
            l.onClick(x, y)
            this.renderer.draw()
        }))
        canvas.addEventListener('mouseenter', ev => this.renderer.onEnter(ev));
        canvas.addEventListener('mousemove', ev => this.renderer.onPan(ev))
        canvas.addEventListener('wheel', ev => this.renderer.onZoom(ev))
        this.renderer = new WebGLRenderer(this, canvas, xsize, ysize, { scale })
        this.frameCounter = new FrameCounter(10)
        this.running = false
        this.startLoop()
        this.init()
    }

    init() {
        for(const layer of this.layers) {
            layer.init(this.xsize, this.ysize)
        }
        if(this.initFunction) {
            this.initFunction(this)
        }
        this.renderer.draw()
    }

    startLoop() {
        if(this.running)
            this.tick()
        requestAnimationFrame(() => this.startLoop())
    }

    tick() {
        for(const layer of this.layers) {
            layer.prepareForUpdate()
        }
        for(const layer of this.layers) {
            layer.tick()
        }
        this.renderer.draw()
        this.frameCounter.update()
        // console.log(this.frameCounter.getFramerate())
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