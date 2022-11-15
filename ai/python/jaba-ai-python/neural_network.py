import json
import numpy as np

class NeuralNetwork:
    def __init__(self, inputnodes, hiddennodes, outputnodes, learningrate, wih=None, who=None):
        self.inputnodes = inputnodes
        self.hiddennodes = hiddennodes
        self.outputnodes = outputnodes
        self.learningrate = learningrate

        self.wih = wih if wih is not None else np.random.rand(hiddennodes, inputnodes) - 0.5
        self.who = who if who is not None else np.random.rand(outputnodes, hiddennodes) - 0.5

        self.act = np.vectorize(lambda x: 1 / (1 + np.exp(-x)))

    @staticmethod
    def normalize_data(data):
        return (data / 255) * 0.99 + 0.01

    def forward(self, input):
        input = input.reshape(-1, 1)
        if input.shape != (self.inputnodes, 1):
            raise ValueError("Input shape does not match expected shape.")
        h_in = self.wih @ input
        h_out = self.act(h_in)

        o_in = self.who @ h_out
        actual = self.act(o_in)

        self.cache = {'input': input, 'h_out': h_out, 'actual': actual}

        return actual

    def backward(self, target):
        target = target.reshape(-1, 1)

        if 'input' not in self.cache:
            self.cache['input'] = np.zeros((self.inputnodes, 1))

        h_in = self.wih @ self.cache['input']
        self.cache['h_out'] = self.act(h_in)

        o_in = self.who @ self.cache['h_out']
        self.cache['actual'] = self.act(o_in)

        dEdA = target - self.cache['actual']
        o_dAdZ = self.cache['actual'] * (1 - self.cache['actual'])

        dwho = (dEdA * o_dAdZ) @ self.cache['h_out'].T

        h_err = self.who.T @ (dEdA * o_dAdZ)
        h_dAdZ = self.cache['h_out'] * (1 - self.cache['h_out'])

        dwih = (h_err * h_dAdZ) @ self.cache['input'].T

        self.cache.update({'dwih': dwih, 'dwho': dwho, 'loss': np.sum(np.square(dEdA))})

    def update(self):
        if 'dwih' in self.cache and 'dwho' in self.cache:
            self.wih += self.learningrate * self.cache['dwih']
            self.who += self.learningrate * self.cache['dwho']
        else:
            print('Cannot update weights, some gradients are missing in the cache.')

    def load_weights(self, filename):
        with open(filename, 'r') as f:
            weights = json.load(f)

        self.wih = np.array(weights['wih'])
        self.who = np.array(weights['who'])

    def train(self, input, target):
        self.forward(input)
        self.backward(target)
        self.update()

    def predict(self, input):
        return self.forward(input)
    