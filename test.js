import glm from './gl-matrix/gl-matrix.js'

const mat4 = glm.mat4
const vec4 = glm.vec4

const proj = mat4.create()
mat4.fromRotationTranslationScale(proj,
    [0, 0, 0, 1],
    [100, 100, 0],
    [1/4, 1/4, 1]);


const point = vec4.fromValues(600, 600, -0.5, 0)

vec4.transformMat4(point, point, proj)

console.log(point)

function print(m) {
    let arr = []
    for(let i = 0; i < 4; i++) {
        arr[i] = m.slice(i * 4, i * 4 + 4)
    }
    console.table(arr)
}


// const cv = document.createElement('canvas')

// const c = cv.getContext('2d')

// console.log(c.getTransform())