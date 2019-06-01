import {CALayer, ABLayer, Cell, Agent, Simulation, makeCell, createLayerControls, createTimeControls, chance, random, weightedChooseDo, createPropertyControl} from '../dist/simulation-station.esm.js'


const params = {
    pathoProb: 0.00001,
    pathoMoveMaxRatio: 0.9,
    pathoMoveMinRatio: 0.7,
    chemoDecayMin: 3,
    chemoDecayCoef: 0.01,
    infectionProbCoef: 0.00001,
    infectionSpreadProb: 0.02,
    deathProb: 0.001,
    regenCoef: 0.005,
    followChemoProb: 0.01,
    followPathoProb: 0.5,
    followInfectionProb: 0.5,
    strayProb: 0.4,
    mastStrayProb: 0.6,
    speed: 0.3
}

createPropertyControl(params, 'regenCoef')

const random_dir = _ => [Math.floor(2-Math.random() * 3) * params.speed, Math.floor(2-Math.random() * 3) * params.speed]

class Dead extends Cell {
    add(){}
    getColor() { return [0,0,0] }
    update() {
        //todo use inert cell count
        if(chance(params.regenCoef) && this.getVonNeumannNeighbours().some(n => n instanceof Alive))
            this.become(Alive);
    }
}


class Alive extends makeCell({
        minColor: [255, 230, 230], 
        maxColor:[255, 0, 0]}) {
    update() {
        if(this > 0) {
            this.add(1/1000)
            if(chance(params.infectionSpreadProb))
                this.getRandomNeigh().add(1/1000)
            if(this > .5 && chance(this * params.deathProb)) {
                this.become(Dead)
            }
        } else if(chance(this.on(patho) * 200 * params.infectionProbCoef)) {
            this.add(1/1000)
        }
    }
}

const tissue = new CALayer(Alive)



const chemo = new CALayer(makeCell({
    minColor: [153, 0, 51], 
    maxColor:[255, 255, 102],
    diffuse: true,
    decayBase:  params.chemoDecayMin/1000,
    decay: params.chemoDecayCoef})
)

const patho = new CALayer(class extends makeCell({
    minColor: [255, 255, 255], 
    maxColor: [255, 0, 0]}) {
    update() {
        if(chance(params.pathoProb))
            this.add(200/200);

        const amount = this * random(params.pathoMoveMinRatio, params.pathoMoveMaxRatio);
        this.add(-amount)
        this.getRandomNeigh().add(amount)
    }
})

class ImmuneCell extends Agent {
    most(layer) {
        const neighs = this.on(layer).getMooreNeighbours()
        let most = 0;
        for(const n of neighs) {
            if(n.value > most) {
                most = n;
            }
        }
        return most == 0 ? random(neighs) : most
    }
    followPatho() { this.moveToward(this.most(patho), params.speed) }
    followChemo() { this.moveToward(this.most(chemo), params.speed) }
    followInfect() { this.moveToward(this.most(tissue), params.speed) }
    stray() { this.move(random_dir()) }
}

class Mast extends ImmuneCell {
    update() {
        const pathoCell = this.on(patho)
        const pathoNeighs = pathoCell.getVonNeumannNeighbours()
        const sum = pathoNeighs.reduce((a, e) => a + e)
        pathoCell.mult(0.7)
        if(sum > 0)
            this.on(chemo).add(sum * 200 / 1000 * 500);

        weightedChooseDo(
            [params.mastStrayProb, _=>this.stray()],
            [1-params.mastStrayProb, _=>this.followPatho()])
    }
    
    static getTexture() { return './mast.png' }
}

class Macrophage extends ImmuneCell {
    update() {
        const pathoCell = this.on(patho)
        pathoCell.mult(0.1)
        weightedChooseDo(
            [params.strayProb, _=>this.stray()],
            [params.followChemoProb, _=>this.followChemo()],
            [params.followPathoProb, _=>this.followPatho()])
    }

    static getTexture() { return './macrophage.png' }
}

class NaturalKiller extends ImmuneCell {
    update() {
        if(this.on(tissue) > 0) {
            this.on(tissue).become(Dead)
        }

        weightedChooseDo(
            [params.strayProb, _=>this.stray()],
            [params.followChemoProb, _=>this.followChemo()],
            [params.followInfectionProb, _=>this.followInfect()])
    }
    
    static getTexture() { return './nk.png' }
}

const mast = new ABLayer()
const macro = new ABLayer()
const killer = new ABLayer()

new Simulation(100, 60, [patho, chemo, tissue, mast, macro, killer], {scale: 8,
init: sim => {
    mast.spreadRandom(Mast, 80)
    macro.spreadRandom(Macrophage, 80)
    killer.spreadRandom(NaturalKiller, 160)
    sim.resume()
    createLayerControls(sim)
    createTimeControls(sim)
}})