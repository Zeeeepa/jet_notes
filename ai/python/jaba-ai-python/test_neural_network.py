import numpy as np
import unittest
from neural_network import NeuralNetwork

class TestNeuralNetwork(unittest.TestCase):
    def setUp(self):
        self.inputnodes = 784
        self.hiddennodes = 100
        self.outputnodes = 10
        self.learningrate = 0.1
        self.nn = NeuralNetwork(self.inputnodes, self.hiddennodes, self.outputnodes, self.learningrate)

    def test_forward(self):
        input = np.zeros(self.inputnodes)
        output = self.nn.forward(input)
        self.assertEqual(output.shape, (self.outputnodes, 1))

    def test_backward(self):
        target = np.zeros(self.outputnodes)
        self.nn.cache = {}
        self.nn.backward(target)
        self.assertEqual(self.nn.cache['input'].shape, (self.inputnodes, 1))
        self.assertEqual(self.nn.cache['h_out'].shape, (self.hiddennodes, 1))
        self.assertEqual(self.nn.cache['actual'].shape, (self.outputnodes, 1))
        self.assertEqual(self.nn.cache['dwho'].shape, (self.outputnodes, self.hiddennodes))
        self.assertEqual(self.nn.cache['dwih'].shape, (self.hiddennodes, self.inputnodes))
        self.assertIsNotNone(self.nn.cache['loss'])

    def test_update(self):
        if 'cache' not in self.nn.__dict__:
            self.nn.cache = {}
        self.nn.update()
        if 'cache' in self.nn.__dict__:
            self.assertIsNotNone(self.nn.wih)
            self.assertIsNotNone(self.nn.who)

    def test_train(self):
        input = np.zeros(self.inputnodes)
        target = np.zeros(self.outputnodes)
        self.nn.train(input, target)
        if 'cache' in self.nn.__dict__:
            self.assertIsNotNone(self.nn.wih)
            self.assertIsNotNone(self.nn.who)
            self.assertEqual(self.nn.cache['input'].shape, (self.inputnodes, 1))
            self.assertEqual(self.nn.cache['h_out'].shape, (self.hiddennodes, 1))
            self.assertEqual(self.nn.cache['actual'].shape, (self.outputnodes, 1))
            self.assertEqual(self.nn.cache['dwho'].shape, (self.outputnodes, self.hiddennodes))
            self.assertEqual(self.nn.cache['dwih'].shape, (self.hiddennodes, self.inputnodes))
            self.assertIsNotNone(self.nn.cache['loss'])

    def test_predict(self):
        input = np.zeros(self.inputnodes)
        output = self.nn.predict(input)
        self.assertEqual(output.shape, (self.outputnodes, 1))

    def test_single_digit_training(self):
        inputnodes = 10
        hiddennodes = 16
        outputnodes = 1
        learningrate = 0.1
        nn = NeuralNetwork(inputnodes, hiddennodes, outputnodes, learningrate)

        input = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        target = np.array([0.9])
        nn.train(input, target)
        if 'cache' in nn.__dict__:
            self.assertIsNotNone(nn.wih)
            self.assertIsNotNone(nn.who)
            self.assertEqual(nn.cache['input'].shape, (inputnodes, 1))
            self.assertEqual(nn.cache['h_out'].shape, (hiddennodes, 1))
            self.assertEqual(nn.cache['actual'].shape, (outputnodes, 1))
            self.assertEqual(nn.cache['dwho'].shape, (outputnodes, hiddennodes))
            self.assertEqual(nn.cache['dwih'].shape, (hiddennodes, inputnodes))
            self.assertIsNotNone(nn.cache['loss'])

    # def test_single_digit_prediction(self):
    #     inputnodes = 10
    #     hiddennodes = 16
    #     outputnodes = 1
    #     learningrate = 0.1
    #     nn = NeuralNetwork(inputnodes, hiddennodes, outputnodes, learningrate)

    #     input = np.array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0])  # "3"
    #     output = nn.predict(input)
    #     accuracy = output[0][0]
    #     self.assertGreaterEqual(accuracy, 0.5)

    #     input = np.array([0, 0, 0, 1, 0, 0, 0, 0, 0, 2])
    #     output = nn.predict(input)
    #     accuracy = output[0][0]
    #     self.assertLess(accuracy, 0.5)

if __name__ == '__main__':
    unittest.main()