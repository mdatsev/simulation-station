import { Layer } from './CommonComponents.js'
import { random, clamp, gradient } from './util.js'
import { CellContainer, InfiniteCellContainer } from './AgentContainer.js'

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
    constructor(x, y, layer) {
        this.x = x
        this.y = y
        this._ssinternal = {}
        this._ssinternal.layer = layer
    }

    become(cell_type) {
        this._ssinternal.become_cell = cell_type
    }

    getMooreDistances() {
        return MOORE_NEIGHS.map(c => Math.sqrt(c[0] * c[0] + c[1] * c[1]))
    }

    getNeighs(coords, layer = this._ssinternal.layer) {
        return coords
            .map(([a, b]) => layer.old_cells.get(this.x + a, this.y + b))
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

    getRandomNeigh(layer = this._ssinternal.layer){
        const x = this.x
        const y = this.y
        return layer.cells.get(...random([
            [x + 1, y    ],
            [x,     y + 1],
            [x - 1, y    ],
            [x,     y - 1]]))
    }

    on(layer) {
        return layer.cells.get(this.x, this.y)
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

    constructor(cellTypes, options) {
        super()
        this.options = options
        this.cellTypes = cellTypes
    }

    init(nxCells, nyCells, options) {
        this.nxCells = nxCells
        this.nyCells = nyCells
        this.cellxSize = 1
        this.cellySize = 1
        this.cells = new CellContainer(nxCells, nyCells, this.cellTypes, this)
        this.running = false
    }

    forEachCell(f, xFrom = 0, yFrom = 0, xTo = this.nxCells, yTo = this.nyCells, randomizeEach) {	
        for(let x = xFrom; x < xTo; x++) {	
            for(let y = yFrom; y < yTo; y++) {	
                f(this.cells.get(x, y))	
            }
        }
    }


    onClick(x, y) {
        const cell_x = Math.floor(x / this.cellxSize),
              cell_y = Math.floor(y / this.cellySize)
        const targetCell = this.cells.get(cell_x, cell_y)
        targetCell.onClick()
    }

    runWithRandom(cellTypes) {
        this.spreadRandomCells(cellTypes)
        this.run()
    }

    spreadRandomCells(cellTypes, xFrom = 0, yFrom = 0, xTo = this.nxCells, yTo = this.nyCells, randomizeEach = true) {
        for(let x = xFrom; x < xTo; x++) {	
            for(let y = yFrom; y < yTo; y++) {
                const new_cell = new cellTypes(x, y, this)
                new_cell.init()
                if(randomizeEach)
                    new_cell.random()
                this.cells.set(new_cell)
            }
        }
    }

    *getCellsIterator() {
        for(const cell of this.cells) {
            yield cell
        }
    }

    prepareForUpdate() {
        this.old_cells = this.cells.copy()
    }

    tick() {
        const generators = []
        for(const cell of this.getCellsIterator()) {
            if(cell.updateParallel != Cell.prototype.updateParallel)
                generators[generators.push(cell.updateParallel()) - 1].cell = cell
            else
                generators[generators.push({next:function(){
                    cell.update(cell.getMooreNeighbours())
                    return {done:true}
                }}) - 1].cell = cell
        }
        for(let updated = false; !updated; ) {
            updated = true
            for(const g of generators) {
                const {value, done} = g.next()
                if(done && value) {
                    cell._ssinternal.update_status = value
                }
                updated &= done
            }
        }
        for(const cell of this.getCellsIterator()) {
            const new_type = cell._ssinternal.become_cell
            if(new_type) {
                this.cells.set(new (new_type)(cell.x, cell.y, this)).init()
            }
        }
        if(this.cells.update)
        {
            this.cells.update()
        }
    }
}


function makeCell(options) {
    const {
        minColor = [0, 0, 0],
        maxColor = [255, 255, 255],
        minValue = 0,
        maxValue = 1,
        diffuse = false,
        decay = 0,
        decayBase = 0
    } = options

    return class extends Cell {
        init() {
            this.value = 0
            this.delta = 0
        }
        add(value) {
            this.delta += value
        }
        mult(value) {
            this.add(this.value * (value - 1))
        }
        getColor() {
            return gradient(minColor, maxColor, (this.value - minValue) / maxValue)
        }
        _diffuse() {
            let basePortion = 0;
            const neighs = this.getMooreNeighbours()
            const dist = this.getMooreDistances()
            for(let i = 0; i < neighs.length; i++) {
                if(this > neighs[i])
                    basePortion += dist[i]
            }
            for(let i = 0; i < neighs.length; i++) {
                if(this > neighs[i])
                {                
                    const amount = (this - neighs[i]) / basePortion / dist[i];
                    neighs[i].curr.add(amount);
                    this.add(-amount);
                }
            }
        }
        _decay() {
            if(this > decayBase)
                this.add(-(this * decay + decayBase))
        }
        *updateParallel() { 
            this.update()
            yield
            if(diffuse)
                this._diffuse()
            if(decay)
                this._decay()
            this.value += this.delta
            this.delta = 0
            this.value = clamp(this.value, minValue, maxValue)
        }
        valueOf() {
            return this.value
        }
    }
}

export {
    CALayer,
    Cell,
    EmptyCell,
    gradient,
    makeCell
}