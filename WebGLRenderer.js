import glm from './gl-matrix/gl-matrix.js'

const mat4 = glm.mat4

class WebGLRenderer {

    initializeWebGLData(xRatio, yRatio) {
        const gl = this.gl
        if (!gl)
            throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uProjectionMatrix;
            varying highp vec2 vTextureCoord;
            void main(void) {
                gl_Position = uProjectionMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `;
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);

        const fsSource = `
            varying highp vec2 vTextureCoord;
            uniform sampler2D uSampler;
            void main(void) {
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
            throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));

        this.uprojectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
        this.uSampler = gl.getUniformLocation(shaderProgram, 'uSampler')
        this.shaderProgram = shaderProgram

        const textureCoords = [
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];

        const positions = [
            xRatio,  yRatio,
            -xRatio,  yRatio,
            xRatio, -yRatio,
            -xRatio, -yRatio,
        ];

        const indices = [0, 1, 2, 1, 2, 3];

        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);

        function createBuffer(target, arr) {
            const buffer = gl.createBuffer();
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, arr, gl.STATIC_DRAW);
            return buffer
        }
        function setAttribute(attr) {
            const a = gl.getAttribLocation(shaderProgram, attr);
            gl.enableVertexAttribArray(a);
            gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        }

        createBuffer(gl.ARRAY_BUFFER, new Float32Array(positions))
        setAttribute('aVertexPosition')
        createBuffer(gl.ARRAY_BUFFER, new Float32Array(textureCoords))
        setAttribute('aTextureCoord')

        this.EBO = createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array(this.width * this.height * 4));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.texture = texture
    }

    constructor(sim, canvas, width, height, options) {
        let {
            scale = 1
        } = options

        this.sim = sim
        this.gl = canvas.getContext('webgl2');
        this.width = width
        this.height = height
        console.log(width, canvas.width, height, canvas.height)
        this.initializeWebGLData(width / canvas.width, height / canvas.height)
        this.scale = scale
        this.translateX = 0
        this.translateY = 0
        this.projectionMatrix = mat4.create();
        this.updateProjectionMatrix()
    }

    updateProjectionMatrix() {
        mat4.fromRotationTranslationScale(this.projectionMatrix,
            [0, 0, 0, 1],
            [this.translateX, this.translateY, 0],
            [this.scale, this.scale, 1]);
    }

    draw(now = 0) {
        const gl = this.gl
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.shaderProgram);

        gl.uniformMatrix4fv(
            this.uprojectionMatrix,
            false,
            this.projectionMatrix );

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        const image = new Uint8Array(this.width * this.height * 4);
        for(const layer of this.sim.layers)
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const cell = layer.cells[i][j]
                const col = cell.getColor()
                if(!col)
                    continue
                const pos = (j * this.width + i) * 4
                image[pos + 0] = col[0];
                image[pos + 1] = col[1];
                image[pos + 2] = col[2];
                image[pos + 3] = col.length == 3 ? 255 : col[3];
            }
        }

        gl.texSubImage2D(gl.TEXTURE_2D, 0,
            0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE,
            image);

        gl.uniform1i(this.uSampler, 0);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        
    }
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export {
    WebGLRenderer
}