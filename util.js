function createCanvas(width, height) {
    const new_canvas = document.createElement('canvas')
    new_canvas.width = width
    new_canvas.height = height
    document.body.appendChild(new_canvas)
    return new_canvas
}

function createButton(callback, text) {
    const btn = document.createElement('button')
    btn.innerHTML = text
    document.body.appendChild(btn)
    btn.addEventListener('click', callback)
    return btn
}

function clickToCanvasCoordinates(event, translateX, translateY, scale) {
    const rect = event.target.getBoundingClientRect()
    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top
    const x = (canvasX - translateX) / scale
    const y = (canvasY - translateY) / scale
    return [x, y]
}

function random(arg1, arg2) {
    if(Array.isArray(arg1)) {
        return arg1[Math.floor(Math.random() * arg1.length)]
    } else {
        return Math.random() * (arg2 - arg1) + arg1
    }
}

function map(n, in_from, in_to, out_from, out_to) {
    return out_from + (n - in_from) / (in_to - in_from) * (out_to - out_from);
}

function hueToRgb(h) {
    const mod = (number, limit) => (number < 0 ? number + limit : number % limit)
    const h2rgb = (initT) => {
        const t = mod(initT, 1)
    
        if (t < 1 / 6) {
            return 6 * t
        }
        if (t < 1 / 2) {
            return 1
        }
        if (t < 2 / 3) {
            return ((2 / 3) - t) * 6
        }
    
        return 0
    }
    
    const r = h2rgb(h + (1 / 3))
    const g = h2rgb(h)
    const b = h2rgb(h - (1 / 3))
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export {
    random,
    createCanvas,
    createButton,
    clickToCanvasCoordinates,
    map,
    hueToRgb
}