import {createButton} from './util.js'

function createCAControls(ca, parent = document.body) {
    
    const el = document.createElement('div')
    
    el.appendChild(createButton(() => ca.pause(), 'Pause'))
    el.appendChild(createButton(() => ca.resume(), 'Resume'))
    el.appendChild(createButton(() => ca.tick(), 'Step'))

    return parent.appendChild(el)
}

export {
    createCAControls
}