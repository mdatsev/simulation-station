export default class CARenderer {
    constructor(ab, canvas, enablePixelDrawing) {
        this.ab = ab
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d', { alpha: false })
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for(const a of this.ab.agents) {
            this.ctx.fillStyle = a.getColor()
            this.ctx.beginPath()
            this.ctx.arc(a.x, a.y, 10, 0, 2 * Math.PI, false)
            this.ctx.fill()
        }
    }
}