export default class CARenderer {
    constructor(ca, canvas, enablePixelDrawing) {
        this.ca = ca
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d', { alpha: false })
        if(enablePixelDrawing) {
            this.image_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        }
        this.pixelDrawing = enablePixelDrawing
    }

    draw() {
        if(this.pixelDrawing) {
            for(const cell of this.ca.getCellsIterator()) {
                let [r, g, b] = cell.getColorRaw()
                const pos = (cell.y * this.canvas.width + cell.x) << 2
                this.image_data.data[pos] = r
                this.image_data.data[pos + 1] = g
                this.image_data.data[pos + 2] = b
            }
            this.ctx.putImageData(this.image_data, 0, 0)
        } else {
            for(const cell of this.ca.getCellsIterator()) {
                this.ctx.fillStyle = cell.getColor()
                this.ctx.fillRect(cell.x * this.ca.cellxSize, cell.y * this.ca.cellySize, this.ca.cellxSize, this.ca.cellySize)
            }
        }
    }

    redrawCell(cell) {
        this.ctx.fillStyle = cell.getColor()
        this.ctx.fillRect(cell.x * this.ca.cellxSize, cell.y * this.ca.cellySize, this.ca.cellxSize, this.ca.cellySize)
    }
}