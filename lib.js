class CellularAutomata {
    constructor(nxCells, nyCells, canvas = {}) {
        this.nxCells = nxCells
        this.nyCells = nyCells
        
        if(canvas instanceof HTMLCanvasElement) {
            this.canvas = canvas
        } else if(canvas.width && canvas.height) {
            const new_canvas = document.createElement('canvas')
            new_canvas.width = canvas.width
            new_canvas.height = canvas.height
            document.body.appendChild(new_canvas)
            this.canvas = new_canvas
        } else {
            const new_canvas = document.createElement('canvas')
            new_canvas.width = nxCells * 4
            new_canvas.height = nyCells * 4
            document.body.appendChild(new_canvas)
            this.canvas = new_canvas
        }
        this.ctx = this.canvas.getContext('2d', { alpha: false })
        this.image_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        this.cellxSize = this.canvas.width / nxCells
        this.cellySize = this.canvas.height / nxCells
        
    }

    runWithRandom(cellTypes) {
        if(cellTypes instanceof Function) {
            cellTypes = [cellTypes]
        }
        this.cells = []
        
        for(let x = 0; x < this.nxCells; x++) {
            this.cells.push([])
            for(let y = 0; y < this.nyCells; y++) {
                const cellType = cellTypes[Math.floor(Math.random() * cellTypes.length)]
                const cell = new (cellType)()
                cell.random()
                this.cells[x].push(cell)
            }
        }

        ;(function loop(t) {
            t.loop()
            requestAnimationFrame(_=>loop(t))
        })(this)
    }
    cells_safe(cells, x, y) {
        const mod = (n, M) => ((n % M) + M) % M
        return cells[mod(x, this.nxCells)][mod(y, this.nyCells)]
    }
    loop() {
        for(let x = 0; x < this.nxCells; x++) {
            for(let y = 0; y < this.nyCells; y++) {
                let [r, g, b] = this.cells[x][y].getColorRaw()
                const pos = (y * this.canvas.width + x) << 2
                this.image_data.data[pos] = r
                this.image_data.data[pos + 1] = g
                this.image_data.data[pos + 2] = b
                // this.ctx.fillStyle = this.cells[x][y].getColor()
                // this.ctx.fillRect(x * this.cellxSize, y * this.cellySize, this.cellxSize, this.cellySize)
            }
        }
        this.ctx.putImageData(this.image_data, 0, 0)

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
}

export {
    CellularAutomata,
    Cell
}