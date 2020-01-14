import { Layer } from './CommonComponents.js'

class ShaderLayer extends Layer {
  constructor({fragSrc} = {}) {
    super()
    this.fragSrc = fragSrc
  }

  getCustomShaders() {
    return {
      fragSrc: this.fragSrc
    }
  }
}

export {
  ShaderLayer
}