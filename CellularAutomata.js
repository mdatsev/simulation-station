import FrameCounter from './FrameCounter.js'
import CARenderer from './CARenderer.js'
import {random, createCanvas} from './util.js'

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


class CellularAutomata {
    constructor(nxCells, nyCells, canvas = {}, options = {}) {
        const {
            enablePixelDrawing = false,
        } = options
        canvas = chooseCanvas(nxCells, nyCells, canvas, enablePixelDrawing)
        this.nxCells = nxCells
        this.nyCells = nyCells
        this.cellxSize = canvas.width / nxCells
        this.cellySize = canvas.height / nxCells
        this.cells = []
        this.frameCounter = new FrameCounter(100)
        this.renderer = new CARenderer(this, canvas, enablePixelDrawing)
    }

    run() {
        this.startLoop()
    }

    runWithRandom(cellTypes) {
        this.spreadRandomCells(cellTypes)
        this.run()
    }

    spreadRandomCells(cellTypes, randomizeEach = true) {
        if(cellTypes instanceof Function) {
            cellTypes = [cellTypes]
        }

        for(let x = 0; x < this.nxCells; x++) {
            this.cells.push([])
            for(let y = 0; y < this.nyCells; y++) {
                const cellType = random(cellTypes)
                const cell = new (cellType)()
                if(randomizeEach)
                    cell.random()
                this.cells[x].push(cell)
            }
        }
    }

    forEachCell(f, xFrom = 0, yFrom = 0, xTo = this.nxCells, yTo = this.nyCells, randomizeEach) {
        for(let x = xFrom; x < xTo; x++) {
            for(let y = yFrom; y < yTo; y++) {
                f(this.cells[x][y])
            }
        }
    }  

    mapCells(f, xFrom = 0, yFrom = 0, xTo = this.nxCells, yTo = this.nyCells, randomizeEach) {
        for(let x = xFrom; x < xTo; x++) {
            for(let y = yFrom; y < yTo; y++) {
                this.cells[x][y] = f(this.cells[x][y])
            }
        }
    }    

    getCells() {
        return this.cells
    }

    startLoop() {
        this.tick()
        requestAnimationFrame(this.startLoop.bind(this))
    }

    cells_safe(cells, x, y) {
        const mod = (n, M) => ((n % M) + M) % M
        return cells[mod(x, this.nxCells)][mod(y, this.nyCells)]
    }

    tick() {
        this.renderer.draw()

        const old_cells = []
    
        for(let x = 0; x < this.nxCells; x++) {
            old_cells.push([])
            for(let y = 0; y < this.nyCells; y++) {
                old_cells[x].push(Object.assign(new (this.cells[x][y].constructor)(), this.cells[x][y]))
            }
        }
        for(let x = 0; x < this.nxCells; x++) {
            for(let y = 0; y < this.nyCells; y++) {
                const cur_cell = this.cells[x][y]
                const int = cur_cell._ssinternal
                const new_type = int.become_cell
                if(new_type) {
                    this.cells[x][y] = new (new_type)()
                } else {
                    this.cells[x][y].update([
                        [x + 1, y    ],
                        [x,     y + 1],
                        [x + 1, y + 1],
                        [x - 1, y    ],
                        [x,     y - 1],
                        [x - 1, y - 1],
                        [x + 1, y - 1],
                        [x - 1, y + 1]].map(p => this.cells_safe(old_cells, ...p)))
                }
            }
        }
        this.frameCounter.update()
        console.log(this.frameCounter.getFramerate())
    }
}

class Cell {
    constructor() {
        this._ssinternal = {}
    }
    random() {}
    init() {}
    become(cell_type) {
        this._ssinternal.become_cell = cell_type
    }
    getColorRaw() { return [255, 0, 255] }
    getColor() { return '#ff00ff' }
}

export {
    CellularAutomata,
    Cell
}