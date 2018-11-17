function createCanvas(width, height) {
    const new_canvas = document.createElement('canvas')
    new_canvas.width = width
    new_canvas.height = height
    document.body.appendChild(new_canvas)
    return new_canvas
}

function random(arg1, arg2) {
    if(Array.isArray(arg1)) {
        return arg1[Math.floor(Math.random() * arg1.length)]
    } else {
        return Math.random() * (arg2 - arg1) + arg1
    }
}

export {
    random,
    createCanvas
}