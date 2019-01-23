import {createButton} from './util.js'

function createCAControls(ca, parent = document.body) {
    
    const el = document.createElement('div')
    
    el.appendChild(createButton(() => ca.pause(), 'Pause'))
    el.appendChild(createButton(() => ca.resume(), 'Resume'))
    el.appendChild(createButton(() => ca.tick(), 'Step'))

    return parent.appendChild(el)
}

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
        el.appendChild(createCheckboxLabel(() => layer.visible ^= 1))
    }
    return parent.appendChild(el)
}


export {
    createCAControls,
    createLayerControls
}