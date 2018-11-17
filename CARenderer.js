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
            for(let x = 0; x < this.ca.nxCells; x++) {
                for(let y = 0; y < this.ca.nyCells; y++) {
                    let [r, g, b] = this.ca.cells[x][y].getColorRaw()
                    const pos = (y * this.canvas.width + x) << 2
                    this.image_data.data[pos] = r
                    this.image_data.data[pos + 1] = g
                    this.image_data.data[pos + 2] = b
                }
            }
            this.ctx.putImageData(this.image_data, 0, 0)
        } else {
            for(let x = 0; x < this.ca.nxCells; x++) {
                for(let y = 0; y < this.ca.nyCells; y++) {
                    this.ctx.fillStyle = this.ca.cells[x][y].getColor()
                    this.ctx.fillRect(x * this.ca.cellxSize, y * this.ca.cellySize, this.ca.cellxSize, this.ca.cellySize)
                }
            }
        }
    }
}