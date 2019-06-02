import {ABLayer, Agent} from './Simulation.js'
import SLS from './SingleLayerSimulation.js'

const AgentBased = SLS(ABLayer)

export {
    AgentBased,
    ABLayer,
    Agent
}