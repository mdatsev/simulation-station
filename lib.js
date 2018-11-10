function createCanvas(width, height) {
    const new_canvas = document.createElement('canvas')
    new_canvas.width = width
    new_canvas.height = height
    document.body.appendChild(new_canvas)
    return new_canvas
}

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}


class CellularAutomata {
    constructor(nxCells, nyCells, canvas = {}, options = {}) {
        const {
            enablePixelDrawing = false,
        } = options

        this.nxCells = nxCells
        this.nyCells = nyCells

        if(canvas instanceof HTMLCanvasElement)
            this.canvas = canvas
        else if(canvas.width && canvas.height)
            this.canvas = createCanvas(canvas.width, canvas.height)
        else if(typeof canvas == 'number')
            this.canvas = createCanvas(nxCells * canvas, nyCells * canvas)
        else if(enablePixelDrawing)
            this.canvas = createCanvas(nxCells, nyCells)
        else
            this.canvas = createCanvas(nxCells * 4, nyCells * 4)

        this.ctx = this.canvas.getContext('2d', { alpha: false })

        this.cellxSize = this.canvas.width / nxCells
        this.cellySize = this.canvas.height / nxCells

        if(enablePixelDrawing) {
            this.image_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        }
        this.pixelDrawing = enablePixelDrawing

    }

    runWithRandom(cellTypes) {
        if(cellTypes instanceof Function) {
            cellTypes = [cellTypes]
        }

        this.cells = []

        for(let x = 0; x < this.nxCells; x++) {
            this.cells.push([])
            for(let y = 0; y < this.nyCells; y++) {
                const cellType = random(cellTypes)
                const cell = new (cellType)()
                cell.random()
                this.cells[x].push(cell)
            }
        }

        this.startLoop()
    }

    startLoop() {
        this.tick()
        requestAnimationFrame(this.startLoop.bind(this))
    }

    cells_safe(cells, x, y) {
        const mod = (n, M) => ((n % M) + M) % M
        return cells[mod(x, this.nxCells)][mod(y, this.nyCells)]
    }

    draw() {
        if(this.pixelDrawing) {
            for(let x = 0; x < this.nxCells; x++) {
                for(let y = 0; y < this.nyCells; y++) {
                    let [r, g, b] = this.cells[x][y].getColorRaw()
                    const pos = (y * this.canvas.width + x) << 2
                    this.image_data.data[pos] = r
                    this.image_data.data[pos + 1] = g
                    this.image_data.data[pos + 2] = b
                }
            }
            this.ctx.putImageData(this.image_data, 0, 0)
        } else {
            for(let x = 0; x < this.nxCells; x++) {
                for(let y = 0; y < this.nyCells; y++) {
                    this.ctx.fillStyle = this.cells[x][y].getColor()
                    this.ctx.fillRect(x * this.cellxSize, y * this.cellySize, this.cellxSize, this.cellySize)
                }
            }
        }
        
        
    }

    tick() {
        this.draw()

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
    getColorRaw() { return [255, 0, 255] }
    getColor() { return '#ff00ff' }
}

export {
    CellularAutomata,
    Cell
}