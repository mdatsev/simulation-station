import {createButton} from './util.js'

function createCheckboxLabel(callback, text) {
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    document.body.appendChild(cb);
    cb.addEventListener('click', callback)
    return cb
}

function createLayerControls(sim, parent = document.body) {
    
    const el = document.createElement('div')
    for(const layer of sim.layers) {
        el.appendChild(createCheckboxLabel(() => {layer.visible ^= 1; sim.renderer.draw()}))
    }
    return parent.appendChild(el)
}

function createTimeControls(sim, parent = document.body) {
    
    const el = document.createElement('div')
    
    el.appendChild(createButton(() => sim.pause(), 'Pause'))
    el.appendChild(createButton(() => sim.resume(), 'Resume'))
    el.appendChild(createButton(() => sim.tick(), 'Step'))
    el.appendChild(createButton(() => sim.init(), 'Restart'))

    return parent.appendChild(el)
}

function createPropertyControl(object, property, parent = document.body, value = object[property]) {
    const input = document.createElement('input')
    switch(value.constructor) {
        case String: input.type = 'text'; break;
        case Number: input.type = 'number'; break;
    }
    input.value = object[property];
    input.addEventListener('input', ev => {
        object[property] = input.value
    }) 
    return parent.appendChild(input)
}

export {
    createTimeControls,
    createLayerControls,
    createPropertyControl
}