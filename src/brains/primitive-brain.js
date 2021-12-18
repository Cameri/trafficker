import NeuralNetwork from 'deepneuralnet';

export class PrimitiveBrain extends NeuralNetwork {
    constructor (learnRate) {
        super([5 * 10], learnRate)
    }
}

