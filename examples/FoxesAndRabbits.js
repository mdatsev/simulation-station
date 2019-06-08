// import {ABLayer, CALayer, Simulation, Agent, Cell} from '../Simulation.js'
// import { createTimeControls, createPropertyControl } from '../UI.js'

// const params = {
//     rabbitChance: .99,
//     foxChance: .9,
//     foxHunger: 100,
//     distanceToEat: 20
// }

// const ab = new ABLayer()
// const srandom = () => (.5 - Math.random()) * 4
// class Rabbit extends Agent {

//     init() {
//         this.vx = srandom()
//         this.vy = srandom()
//     }

//     static getTexture() {
//         return './rabbit.png'
//     }

//     update() {
//         const r = Math.random()
//         if(r > params.rabbitChance)
//         {
//             this.spawn(Rabbit)
//         }
//         this.move(this.vx, this.vy)
//     }
// }

// class Fox extends Agent {

//     init() {
//         this.hunger = 0
//         this.vx = srandom()
//         this.vy = srandom()
//     }

//     static getTexture() {
//         return './fox.png'
//     }

//     update() {
//         this.hunger++
//         if(this.hunger > params.foxHunger) {
//             this.destroy(this)
//         }
//         this.neighsWithin(params.distanceToEat, Rabbit).forEach(a => {
//             this.destroy(a)
//             if(Math.random() > params.foxChance)
//                 this.spawn(Fox)
//             this.hunger = 0
//         })
//         this.move(this.vx, this.vy)
//     }
// }
// createTimeControls(new Simulation(800, 800, ab, {init: s => {
//     ab.spreadRandom(Fox, 20)
//     ab.spreadRandom(Rabbit, 50)
//     // s.resume()
// }}))

// createPropertyControl(params, 'rabbitChance')
// createPropertyControl(params, 'foxChance')
// createPropertyControl(params, 'foxHunger')
// createPropertyControl(params, 'distanceToEat')

