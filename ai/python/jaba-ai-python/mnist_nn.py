import json
import csv
import numpy as np
from neural_network import NeuralNetwork

def load_data(filename, n_rows=None):
    with open(filename) as f:
        reader = csv.reader(f)
        data = [row for row in reader]
    data = np.array(data, dtype=np.float32)
    if n_rows is not None:
        data = data[:n_rows]
    X = data[:, 1:]
    y = data[:, 0].astype(int)
    return X, y

def load_weights(inputnodes, hiddennodes, outputnodes, learningrate, epochs, weightsfile):
    nn = NeuralNetwork(inputnodes, hiddennodes, outputnodes, learningrate, epochs, weightsfile)

    with open(weightsfile, 'r') as f:
        weights = json.load(f)
    nn.wih = np.array(weights['wih'])
    nn.who = np.array(weights['who'])

    return nn

def train(inputnodes, hiddennodes, outputnodes, learningrate, epochs, trainfile, n_rows=None):
    nn = NeuralNetwork(inputnodes, hiddennodes, outputnodes, learningrate)
    X_train, y_train = load_data(trainfile, n_rows=n_rows)
    for epoch in range(epochs):
        for i in range(X_train.shape[0]):
            input = X_train[i]
            target = np.zeros(outputnodes) + 0.01
            target[y_train[i]] = 0.99
            nn.train(input, target)
        print(f"Epoch {epoch+1}/{epochs} Loss: {nn.cache['loss']:.4f}")
    return nn

def test(nn, testfile, n_rows=None):
    X_test, y_test = load_data(testfile, n_rows=n_rows)
    correct = 0
    for i in range(X_test.shape[0]):
        input = X_test[i]
        output = nn.predict(input)
        if np.argmax(output) == y_test[i]:
            correct += 1
    accuracy = correct / X_test.shape[0]
    print(f"Test accuracy: {accuracy:.4f}")
    return accuracy
