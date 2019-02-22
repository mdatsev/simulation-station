import { Layer } from './CommonComponents.js'
import { random, clamp, gradient } from './util.js'

const VON_NEUMANN_NEIGHS = [
    [ 1,  0],
    [ 0,  1],
    [-1,  0],
    [ 0, -1]
]

const DIAG_NEIGHS = [
    [ 1,  1],
    [-1,  1],
    [-1, -1],
    [ 1, -1]
]

const MOORE_NEIGHS = [
    ...VON_NEUMANN_NEIGHS,
    ...DIAG_NEIGHS
]


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

    getMooreDistances() {
        return MOORE_NEIGHS.map(c => Math.sqrt(c[0] * c[0] + c[1] * c[1]))
    }

    getNeighs(coords, layer = this._ssinternal.sim) {
        return coords
            .map(([a, b]) => [this.x + a, this.y + b])
            .map(p => layer.cells_safe(layer.old_cells, ...p))
    }

    getVonNeumannNeighbours(layer){
        return this.getNeighs(VON_NEUMANN_NEIGHS, layer)
    }

    getDiagonalNeighbours(layer){
        return this.getNeighs(DIAG_NEIGHS, layer)
    }

    getMooreNeighbours(layer){
        return this.getNeighs(MOORE_NEIGHS, layer)
    }

    getRandomNeigh(layer = this._ssinternal.sim){
        const x = this.x
        const y = this.y
        return layer.cells_safe(layer.cells, ...random([
            [x + 1, y    ],
            [x,     y + 1],
            [x - 1, y    ],
            [x,     y - 1]]))
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
        if(!cells)
            debugger
        return cells[mod(x, this.nxCells)][mod(y, this.nyCells)]
    }

    prepareForUpdate() {
        this.old_cells = []
        for(let x = 0; x < this.nxCells; x++) {
            this.old_cells.push([])
            for(let y = 0; y < this.nyCells; y++) {
                const curr = this.cells[x][y]
                const old = Object.assign(new (this.cells[x][y].constructor)(), curr)
                old.curr = curr
                this.old_cells[x].push(old)
            }
        }
    }

    tick() {
        const generators = []
        for(const cell of this.getCellsIterator()) {
            if(cell.updateParallel != Cell.prototype.updateParallel)
                generators.push(cell.updateParallel())
            else
                generators.push({next:function(){
                    cell.update(cell.getMooreNeighbours())
                    return {done:true}
                }})
        }
        for(let updated = false; !updated; ) {
            updated = true
            for(const g of generators) {
                const {done} = g.next()
                updated &= done
            }
        }
        for(const cell of this.getCellsIterator()) {
            const new_type = cell._ssinternal.become_cell
            if(new_type) {
                (this.cells[cell.x][cell.y] = new (new_type)(cell.x, cell.y, this)).init()
            }
        }
    }
}


function simpleValueCell(minColor, maxColor, max, min = 0) {
    return class SimpleValueCell extends Cell {
        init() {
            this.value = 0
            this.delta = 0
        }
        add(value) {
            this.delta += value
        }
        getColor() {
            return gradient(minColor, maxColor, this.value / max)
        }
        *updateParallel() { 
            this.update()
            yield
            this.value += this.delta
            this.delta = 0
            this.value = clamp(this.value, min, max)
        }
    }
}

export {
    CALayer,
    Cell,
    EmptyCell,
    gradient,
    simpleValueCell
}