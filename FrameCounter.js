export default class FrameCounter { 
    constructor(avg_size) {
        this.avg_size = avg_size
        this.n = 0
        this.arr = []
        this.lastTime = performance.now()
    }

    update() {
        const d = performance.now() - this.lastTime
        if(this.arr.length == this.avg_size) {
            this.arr[this.n++] = d
            this.n %= this.avg_size
        } else {
            this.arr.push(d)
        }
        this.lastTime = performance.now()
    }

    getFramerate() {
        return 1000 / (this.arr.reduce((a, b) => a + b) / this.arr.length)
    }
}