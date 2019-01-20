import { Layer } from './CommonComponents.js'
import { random, clickToCanvasCoordinates } from './util.js'

class Cell {
    constructor(x, y, sim) {
        this.x = x
        this.y = y
        this._ssinternal = {}
        this._ssinternal.sim = sim
    }

    become(cell_type) {
        this._ssinternal.become_cell = cell_type
    }

    getMooreNeighbours(layer = this._ssinternal.sim){
        const x = this.x
        const y = this.y
        return [
            [x + 1, y    ],
            [x,     y + 1],
            [x + 1, y + 1],
            [x - 1, y    ],
            [x,     y - 1],
            [x - 1, y - 1],
            [x + 1, y - 1],
            [x - 1, y + 1]].map(p => layer.cells_safe(layer.old_cells, ...p))
    }

    on(layer) {
        return layer.cells[this.x][this.y]
    }

    // impl
    random() {}
    init() {}
    getColor() { return [255, 0, 255] }
    update() {}
    onClick() {}
}

class EmptyCell extends Cell {
    constructor(...args) {
        super(...args)
        this._ssinternal.is_empty_cell = true
    }

    getColor() {
        return null
    }

    getColorRaw() {
        return null
    }
}

class CALayer extends Layer {

    constructor(cellTypes) {
        super()
        this.cellTypes = cellTypes
    }

    init(nxCells, nyCells, options) {
        this.nxCells = nxCells
        this.nyCells = nyCells
        this.cellxSize = 1
        this.cellySize = 1
        this.cells = []
        this.running = false
        this.spreadRandomCells(this.cellTypes)
        this.startLoop()
    }

    pause() {
        this.running = false
    }

    resume() {
        this.running = true
    }

    run() {
        this.resume()
    }

    forEachCell(f, xFrom = 0, yFrom = 0, xTo = this.nxCells, yTo = this.nyCells, randomizeEach) {	
        for(let x = xFrom; x < xTo; x++) {	
            for(let y = yFrom; y < yTo; y++) {	
                f(this.cells[x][y])	
            }
        }
    }   

    onClick(x, y) {
        const cell_x = Math.floor(x / this.cellxSize),
              cell_y = Math.floor(y / this.cellySize)
        const targetCell = this.cells[cell_x][cell_y]
        targetCell.onClick()
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
                const cell = new (cellType)(x, y, this)
                cell.init()
                if(randomizeEach)
                    cell.random()
                this.cells[x].push(cell)
            }
        }
    }

    *getCellsIterator() {
        for(let x = 0; x < this.nxCells; x++) {
            for(let y = 0; y < this.nyCells; y++) {
                yield this.cells[x][y]
            }
        }
    }

    startLoop() {
        if(this.running)
            this.tick()
        requestAnimationFrame(() => this.startLoop())
    }

    cells_safe(cells, x, y) {
        const mod = (n, M) => ((n % M) + M) % M
        return cells[mod(x, this.nxCells)][mod(y, this.nyCells)]
    }

    tick() {
        const old_cells = this.old_cells = []
        for(let x = 0; x < this.nxCells; x++) {
            old_cells.push([])
            for(let y = 0; y < this.nyCells; y++) {
                old_cells[x].push(Object.assign(new (this.cells[x][y].constructor)(), this.cells[x][y]))
            }
        }
        for(const cell of this.getCellsIterator()) {
            const int = cell._ssinternal
            const new_type = int.become_cell
            if(new_type) {
                (this.cells[cell.x][cell.y] = new (new_type)(cell.x, cell.y, this)).init()
            } else {
                const x = cell.x
                const y = cell.y
                cell.update(cell.getMooreNeighbours())
            }
        }
    }
}

export {
    CALayer,
    Cell,
    EmptyCell
}