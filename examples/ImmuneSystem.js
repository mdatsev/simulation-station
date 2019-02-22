import {CALayer, ABLayer, Cell, Agent, Simulation, simpleValueCell} from '../Simulation.js'
import {createLayerControls, createTimeControls} from '../UI.js'
import {chance, random} from '../util.js'

const params = {

    pathoMax: 200,
    chemoMax: 1000,
    tissueMax: 1000,
    pathoProb: 0.00001,
    pathoMoveMaxRatio: 0.9,
    pathoMoveMinRatio: 0.7,
    chemoDecayMin: 3,
    chemoDecayCoef: 0.01,
    infectionProbCoef: 0.00001,
    infectionSpreadProb: 0.02,
    deathProb: 0.000001,
    regenCoef: 0.005,
    followChemoProb: 0.1,
    followPathoProb: 0.5,
    followInfectionProb: 0.5,
    strayProb: 0.4,
    mastStrayProb: 0.6,
}

const random_dir = _ => [1-Math.floor(Math.random() * 3), 1-Math.floor(Math.random() * 3)]

class Dead extends Cell {
    getColor() {
        return [0,0,0]
    }
    update() {
        const regenerateProb = 1 * params.regenCoef; //todo use inert cell count
        if(chance(regenerateProb))
            this.become(Alive);
    }
}


class Alive extends simpleValueCell([255, 230, 230], [255, 0, 0], params.tissueMax) {
    update() { 
        const infectProb = this.on(patho).value * params.infectionProbCoef;
        if(this.value === 0) {
            if(chance(infectProb))
                this.add(1)
        } else if(this.value > 0) {
            this.add(1)
            if(chance(params.infectionSpreadProb))
            {
                const n = this.getRandomNeigh()
                if(n instanceof Alive) {
                    n.add(1)
                }
            }    

            if(this.value > 500) {
                const deathProb = this.value * params.deathProb;
                if (chance(deathProb))
                    this.become(Dead)
            }
        } else {
            throw Error(`value is ${this.value}`)
        }
    }
}

const tissue = new CALayer(Alive)

const chemo = new CALayer(class extends simpleValueCell([153, 0, 51], [255, 255, 102], params.chemoMax) {
    update() {
        let basePortion = 0;

        const neighs = this.getMooreNeighbours()
        const dist = this.getMooreDistances()
        for(let i = 0; i < neighs.length; i++) {
            if(this.value > neighs[i].value)
                basePortion += dist[i]
        }
        for(let i = 0; i < neighs.length; i++) {
            if(this.value > neighs[i].value)
            {
                const portion = basePortion * dist[i];
                
                const amount = (this.value - neighs[i].value) / Math.floor(portion);
                neighs[i].curr.add(amount);
                this.add(-amount);
            }
        }
            
        // const neighs = this.getMooreNeighbours()
        // this.add(neighs.map(n => n.value).reduce((a, b) => a + b) / 8 - this.value)
        if(this.value > params.chemoDecayMin) {  
            this.add(-(this.value * params.chemoDecayCoef + params.chemoDecayMin))
        }
    }
})

const patho = new CALayer(class extends simpleValueCell([255, 255, 255], [255, 0, 0], params.pathoMax) {
    update() {
        if(chance(params.pathoProb) &&
                this.value < params.pathoMax)
            this.add(200);

        //Math.round(Math.random()), Math.round(Math.random())
        const low = params.pathoMoveMinRatio;
        const high = params.pathoMoveMaxRatio;

        const amount = random(low, high) * this.value;
        
        this.add(-amount)

        this.getRandomNeigh().add(amount)
    }
})

class Mast extends Agent {
    update() {
        const pathoCell = this.on(patho)
        const pathoNeighs = pathoCell.getVonNeumannNeighbours()
        const sum = pathoNeighs.reduce((a, e) => a + e.value, pathoCell.value)
        pathoCell.add(-Math.floor(pathoCell.value * 0.3))
        if(sum > 0 && this.on(chemo).value < 1000)
            this.on(chemo).add(sum * 500);

        if(chance(params.mastStrayProb))
            this.move(...random_dir());
        else
        {
            const most = pathoNeighs.reduce((a, b) => a.value > b.value ? a : b)
            this.x = most.x
            this.y = most.y
        }
    }
    
    static getTexture() {
        return './mast.png'
    }
}

class Macrophage extends Agent {
    update() {
        const pathoCell = this.on(patho)
        pathoCell.add(-Math.floor(pathoCell.value * 0.9))
        const chemoCell = this.on(chemo)
        const r = Math.random();

        if(r < params.strayProb)
            this.move(...random_dir());
        else if(r < (params.strayProb+params.followChemoProb))
        {
            const most = chemoCell.getMooreNeighbours().reduce((a, b) => a.value > b.value ? a : b)
            this.x = most.x
            this.y = most.y
        }
        else if(r < (params.strayProb+params.followChemoProb+params.followPathoProb))
        {
            const most = pathoCell.getVonNeumannNeighbours().reduce((a, b) => a.value > b.value ? a : b)
            this.x = most.x
            this.y = most.y
        }
    }
    
    static getTexture() {
        return './macrophage.png'
    }
}

class NaturalKiller extends Agent {
    update() {

        if(this.on(tissue).value > 0) {
            this.on(tissue).become(Dead)
        }
        const pathoCell = this.on(patho)
        const chemoCell = this.on(chemo)
        const r = Math.random();

        if(r < params.strayProb)
            this.move(...random_dir());
        else if(r < (params.strayProb+params.followChemoProb))
        {
            const most = chemoCell.getMooreNeighbours().reduce((a, b) => a.value > b.value ? a : b)
            this.x = most.x
            this.y = most.y
        }
        else if(r < (params.strayProb+params.followChemoProb+params.followInfectionProb))
        {
            const most = pathoCell.getVonNeumannNeighbours().reduce((a, b) => a.value > b.value ? a : b)
            this.x = most.x
            this.y = most.y
        }
    }
    
    static getTexture() {
        return './nk.png'
    }
}

const mast = new ABLayer()
const macro = new ABLayer()
const killer = new ABLayer()

new Simulation(100, 100, [patho, chemo, tissue, mast, macro, killer], {scale: 8,
init: sim => {
    mast.spreadRandom(Mast, 100)
    macro.spreadRandom(Macrophage, 100)
    killer.spreadRandom(NaturalKiller, 200)
    sim.resume()
    createLayerControls(sim)
    createTimeControls(sim)
}})