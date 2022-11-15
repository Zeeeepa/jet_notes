import unittest
import os
from neural_network import NeuralNetwork
from mnist_nn import load_data, load_weights, train, test

class TestMNISTNN(unittest.TestCase):
    def setUp(self):
        self.weightsfile = './mnist/mnist_weights.json'
        self.trainfile = './mnist/mnist_train_100.csv'
        self.testfile = './mnist/mnist_test_10.csv'
        self.inputnodes = 784
        self.hiddennodes = 100
        self.outputnodes = 10
        self.learningrate = 0.1
        self.epochs = 10
        self.train_rows = 60000
        self.test_rows = 10000
        self.nn = {}

    def test_load_data(self):
        X, y = load_data(self.trainfile, n_rows=self.train_rows)
        self.assertEqual(X.shape, (self.train_rows, 784))
        self.assertEqual(y.shape, (self.train_rows,))
        self.assertEqual(y[0], 5)
        self.assertAlmostEqual(X[0,0], 0.01)
        self.assertAlmostEqual(X[0,1], 0.01)
        self.assertAlmostEqual(X[0,2], 0.01)
        self.assertAlmostEqual(X[0,-1], 0.886)

    def test_load_weights(self):
        if not os.path.exists(self.weightsfile):
            print(f"Skipping test_load_weights as {self.weightsfile} does not exist")
            return
        
        self.nn = load_weights(self.inputnodes, self.hiddennodes, self.outputnodes, self.learningrate, self.epochs, self.weightsfile)
        self.assertIsNotNone(self.nn.wih)
        self.assertIsNotNone(self.nn.who)
        self.assertEqual(self.nn.wih.shape, (self.hiddennodes, self.inputnodes))
        self.assertEqual(self.nn.who.shape, (self.outputnodes, self.hiddennodes))

        accuracy = test(self.nn, self.testfile, n_rows=self.test_rows)
        self.assertGreater(accuracy, 0.5)

    def test_train_and_test(self):
        self.nn = train(self.inputnodes, self.hiddennodes, self.outputnodes, self.learningrate, self.epochs, self.trainfile, n_rows=self.train_rows)
        self.assertIsNotNone(self.nn.wih)
        self.assertIsNotNone(self.nn.who)
        self.assertEqual(self.nn.wih.shape, (self.hiddennodes, self.inputnodes))
        self.assertEqual(self.nn.who.shape, (self.outputnodes, self.hiddennodes))
        accuracy = test(self.nn, self.testfile, n_rows=self.test_rows)
        self.assertGreater(accuracy, 0.5)


if __name__ == '__main__':
    unittest.main()
