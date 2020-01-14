class Layer {
    constructor(options={}) {
        this.visible = true
        this.static = options.static
    }

    show() {
        this.visible = true
    }

    hide() {
        this.visible = false
    }

    // interface
    init() {}
    prepareForUpdate() {}
    tick() {}
    getCustomShaders() {}
}

export { Layer }