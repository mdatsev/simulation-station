import {createButton} from './util.js'

let idCounter = 0;

function getUniqueId() {
    return '__ssid' + idCounter++;
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
        el.appendChild(createCheckboxLabel(() => {layer.visible ^= 1; sim.renderer.draw()}))
    }
    return parent.appendChild(el)
}

function createLayerGroupControl(layers, names, parent = document.body) {
    const name = getUniqueId()
    const radios = []
    const update = () => layers.forEach((l, i) => l.visible = radios[i].checked)
    const el = document.createElement('div')
    for(let i = 0; i < layers.length; i++) {
        let r = document.createElement('input');
        r.type = 'radio';
        r.value = i
        r.name = name;
        r.id = getUniqueId();
        document.body.appendChild(r);
        let l = document.createElement('label');
        l.htmlFor = r.id
        l.innerText = names[i]
        r.addEventListener('click', update)
        el.appendChild(r)
        el.appendChild(l)
        radios.push(r)
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

function createPropertySlider(object, property, min, max, step, value = object[property], parent = document.body) {
    if(value !== undefined) {
        object[property] = value
    }

    const input = document.createElement('input')
    input.type = 'range'
    input.min = min
    input.max = max
    input.step = step
    input.value = object[property];
    input.addEventListener('input', ev => {
        object[property] = input.value
    }) 
    return parent.appendChild(input)
}

function createPropertyControl(object, property, parent = document.body, value = object[property]) {
    const input = document.createElement('input')
    switch(value.constructor) {
        case String: input.type = 'text'; break;
        case Number: input.type = 'number'; break;
        case Boolean: input.type = 'checkbox'; break;
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
    createPropertyControl,
    createPropertySlider,
    createLayerGroupControl
}