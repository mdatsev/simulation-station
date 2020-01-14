import { CALayer } from './CAComponents.js'
import { ABLayer } from './ABComponents.js'
import { ShaderLayer } from './ShaderLayer.js'
import * as mat4 from './gl-matrix/mat4.js';

function createBuffer(gl, target, arr) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, arr, gl.STATIC_DRAW);
    return buffer
}

function setAttribute(gl, shaderProgram, attr) {
    const a = gl.getAttribLocation(shaderProgram, attr);
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
}

class WebGLRenderer {

    initializeHighLvlLayerWebGLData(width, height) {
        const gl = this.gl
        if (!gl)
            throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');

        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.DST_ALPHA);

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

        const vsSourceInstanced = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
            attribute mat4 aModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying highp vec2 vTextureCoord;
            void main(void) {
                gl_Position = uProjectionMatrix * aModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `;
        const vertexShaderInstanced = loadShader(gl, gl.VERTEX_SHADER, vsSourceInstanced);

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

        const shaderProgramInstanced = gl.createProgram();
        gl.attachShader(shaderProgramInstanced, vertexShaderInstanced);
        gl.attachShader(shaderProgramInstanced, fragmentShader);
        gl.linkProgram(shaderProgramInstanced);

        if (!gl.getProgramParameter(shaderProgramInstanced, gl.LINK_STATUS))
            throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));

        this.uprojectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
        this.uSampler = gl.getUniformLocation(shaderProgram, 'uSampler')
        this.shaderProgram = shaderProgram

        this.uprojectionMatrixInstanced = gl.getUniformLocation(shaderProgramInstanced, 'uProjectionMatrix');
        this.uSamplerInstanced = gl.getUniformLocation(shaderProgramInstanced, 'uSampler')
        this.shaderProgramInstanced = shaderProgramInstanced

        const extension = 0;

        const positions = [
            width+extension,  height+extension,
            -extension,  height+extension,
            width+extension, -extension,
            -extension, -extension,
        ];

        const textureCoords = [
            (width+extension)/width, (height+extension)/height,
            -extension/width, (height+extension)/height,
            (width+extension)/width, -extension/height,
            -extension/width, -extension/height,
        ];

        const positionsInstanced = [
            1,  1,
            0,  1,
            1, 0,
            0, 0,
        ];

        const indices = [0, 1, 2, 1, 2, 3];

        function createBuffer(target, arr) {
            const buffer = gl.createBuffer();
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, arr, gl.STATIC_DRAW);
            return buffer
        }

        function setAttribute(shaderProgram, attr) {
            const a = gl.getAttribLocation(shaderProgram, attr);
            gl.enableVertexAttribArray(a);
            gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        }

        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);
        createBuffer(gl.ARRAY_BUFFER, new Float32Array(positions))
        setAttribute(shaderProgram, 'aVertexPosition')
        createBuffer(gl.ARRAY_BUFFER, new Float32Array(textureCoords))
        setAttribute(shaderProgram, 'aTextureCoord')
        this.EBO = createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))

        this.VAOInstanced = gl.createVertexArray();
        gl.bindVertexArray(this.VAOInstanced);
        createBuffer(gl.ARRAY_BUFFER, new Float32Array(positionsInstanced))
        setAttribute(shaderProgramInstanced, 'aVertexPosition')
        createBuffer(gl.ARRAY_BUFFER, new Float32Array(textureCoords))        
        setAttribute(shaderProgramInstanced, 'aTextureCoord')
        
            

        this.agentsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.agentsBuffer);
        

        let pos = gl.getAttribLocation(shaderProgramInstanced, 'aModelViewMatrix');


        for (var i = 0; i < 4; ++i) {
            gl.vertexAttribDivisor( pos+i, 1 );
            gl.enableVertexAttribArray(pos + i);
            gl.vertexAttribPointer(pos + i, 4, gl.FLOAT, 0, 64, i * 16);
        }
        this.EBOInstanced = createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array(this.width * this.height * 4));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.texture = texture
    }

    initializeLowLvlLayerWebGLData() {
        const gl = this.gl

        for (const [layer, shader] of this.customShaders) {
            if (shader.fragSrc) {

                const vsSource = `
                    attribute vec4 aVertexPosition;
                    attribute vec2 aTextureCoord;
                    uniform mat4 uProjectionMatrix;
                    varying highp vec2 vTextureCoord;
                    varying highp vec2 uv;
                    void main(void) {
                        gl_Position = aVertexPosition;
                        uv = (uProjectionMatrix * aVertexPosition).xy;
                        vTextureCoord = aTextureCoord;
                    }
                `;
                const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);

                const fsSource = shader.fragSrc;

                const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
                const shaderProgram = gl.createProgram();
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
                    throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));

                this.uinvProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
                this.customShaders.set(layer, { ...shader, shaderProgram })

                this.utime = gl.getUniformLocation(shaderProgram, 'utime');

                const positions = [
                    1, 1,
                    -1, 1,
                    1, -1,
                    -1, -1,
                ];

                const indices = [0, 1, 2, 1, 2, 3];

                this.screenVAO = gl.createVertexArray();
                gl.bindVertexArray(this.screenVAO);
                createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions))
                setAttribute(gl, shaderProgram, 'aVertexPosition')
                this.screenEBO = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))
            }
        }
    }

    initializeWebGLData(width, height) {
        const gl = this.gl
        if (!gl)
            throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');

        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.DST_ALPHA);

        if (this.enableShaderDrawing) {
            this.customShaders = new Map()
            for (const layer of this.sim.layers) {
                const shaders = layer.getCustomShaders()
                if (shaders) {
                    this.customShaders.set(layer, shaders)
                }
            }
        }

        if (this.enableCADrawing || this.enableABDrawing) {
            this.initializeHighLvlLayerWebGLData(width, height)
        }
        if (this.enableShaderDrawing) {
            this.initializeLowLvlLayerWebGLData(width, height)
        }
    }

    constructor(sim, canvas, width, height, options) {
        let {
            scale = 1
        } = options

        for (const layer of sim.layers) {
            if (layer instanceof CALayer) {
                this.enableCADrawing = true
            } else if (layer instanceof ABLayer) {
                this.enableABDrawing = true
            } else if (layer instanceof ShaderLayer) {
                this.enableShaderDrawing = true
            }
        }

        this.sim = sim
        this.gl = canvas.getContext('webgl2');
        this.width = width
        this.height = height
        this.initializeWebGLData(width, height)
        this.textures = {}
        this.image = new Uint8Array(this.width * this.height * 4);
        const w2 = canvas.width / 2 / (canvas.width / width)
        const h2 = canvas.height / 2 / (canvas.height / height)
        this.scaleX = 1 / w2
        this.scaleY = 1 / h2
        this.translateX = -w2
        this.translateY = -h2
        this.projectionMatrix = mat4.create();
        this.updateProjectionMatrix()
        this.startTime = +new Date()
    }

    loadTexture(path) {
        const gl = this.gl
        const textureInstanced = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureInstanced);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255]));

        const image = new Image();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, textureInstanced);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        image.src = path;
        this.textures[path] = textureInstanced;
    }

    clickToCanvasCoordinates(event) {
        const rect = event.target.getBoundingClientRect()
        const canvasX = event.clientX - rect.left
        const canvasY = event.clientY - rect.top
        const viewport_x = canvasX / event.target.scrollWidth * 2 - 1
        const viewport_y = canvasY / event.target.scrollHeight * 2 - 1
        const x = (viewport_x / this.scaleX - this.translateX)
        const y = (viewport_y / this.scaleY - this.translateY)
        return [x, y]
    }

    updateProjectionMatrix() {
        const m = mat4.create()
        mat4.scale(m, m, [this.scaleX, -this.scaleY, 1])
        mat4.translate(m, m, [this.translateX, this.translateY, 0])
        this.projectionMatrix = m;

        const inv = mat4.create()
        mat4.invert(inv, m)
        this.inverseProjectionMatrix = inv;
        // const table = []
        // for (let i = 0; i < 4; i++) {
        //     table.push([s[i*4+0], s[i*4+1], s[i*4+2], s[i*4+3]])
        // }
        // console.table(table)
    }

    onZoom(event) {
        let [x, y] = this.clickToCanvasCoordinates(event)
        const origTX = this.translateX
        const origTY = this.translateY
        this.translateX = -x;
        this.translateY = -y;
        let delta = 1 - event.deltaY * 0.002;
        this.scaleX *= delta;
        this.scaleY *= delta;
        this.translateX += (origTX + x) / delta;
        this.translateY += (origTY + y) / delta;
        this.updateProjectionMatrix()
    }

    onPan(event) {
        let [x, y] = this.clickToCanvasCoordinates(event)
        if (event.buttons & 1) {
            let [px, py] = this.clickToCanvasCoordinates(this.pMouseEvent)
            this.translateX += x - px;
            this.translateY += y - py;
        }
        this.pMouseEvent = event
        this.updateProjectionMatrix()
    }

    onEnter(event) {
        this.pMouseEvent = event
    }

    drawCALayer(layer) {
        const gl = this.gl


        gl.useProgram(this.shaderProgram);

        gl.uniformMatrix4fv(
            this.uprojectionMatrix,
            false,
            this.projectionMatrix );        

        gl.bindVertexArray(this.VAO)
        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);


        for(const cell of layer.cells)
        {
            const col = cell.getColor()
            const pos = (cell.y * this.width + cell.x) * 4
            if(!col)
            {
                this.image[pos + 3] = 0
                continue
            }
            this.image[pos + 0] = col[0];
            this.image[pos + 1] = col[1];
            this.image[pos + 2] = col[2];
            this.image[pos + 3] = col.length == 3 ? 255 : col[3];
        }

        gl.texSubImage2D(gl.TEXTURE_2D, 0,
            0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE,
            this.image);

        gl.uniform1i(this.uSampler, 0);

        gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 4);
    }

    drawABLayer(layer) {
        const gl = this.gl

        gl.useProgram(this.shaderProgramInstanced);

        gl.uniformMatrix4fv(
            this.uprojectionMatrixInstanced,
            false,
            this.projectionMatrix);

        for (const [agents, tpath] of layer.getAgentsPartitionedByTexure()) {
            const texture = this.textures[tpath] || this.loadTexture(tpath)
            gl.bindVertexArray(this.VAOInstanced)
            gl.activeTexture(gl.TEXTURE0);

            gl.bindTexture(gl.TEXTURE_2D, texture);

            let buf = []
            for (const agent of agents) {
                buf.push(...agent.transform)
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.agentsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buf), gl.DYNAMIC_DRAW);


            gl.uniform1i(this.uSamplerInstanced, 0);
            gl.uniform1i(this.uSamplerInstanced, 0);
            gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, agents.length);
        }

    }

    drawShaderLayer(layer) {
        const gl = this.gl
        gl.useProgram(this.customShaders.get(layer).shaderProgram);
        gl.uniformMatrix4fv(
            this.uinvProjectionMatrix,
            false,
            this.inverseProjectionMatrix);
        gl.uniform1f(
            this.utime,
            +new Date() - this.startTime);
        gl.bindVertexArray(this.screenVAO);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 4);
    }

    draw(now = 0) {

        const gl = this.gl
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (const layer of this.sim.layers) {
            if (layer.visible) {
                if (layer instanceof CALayer) {
                    this.drawCALayer(layer)
                } else if (layer instanceof ABLayer) {
                    this.drawABLayer(layer)
                } else if (layer instanceof ShaderLayer) {
                    this.drawShaderLayer(layer)
                }
            }
        }

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
