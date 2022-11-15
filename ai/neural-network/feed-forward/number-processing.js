// Import the required libraries
const math = require('mathjs');

// Define the activation function (sigmoid) and its derivative
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidDerivative(x) {
  const sig = sigmoid(x);
  return sig * (1 - sig);
}

// Create a simple feedforward neural network with one hidden layer
class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;

    // Initialize the weights with random values
    this.weightsInputHidden = math.random([this.inputNodes, this.hiddenNodes], -1, 1);
    this.weightsHiddenOutput = math.random([this.hiddenNodes, this.outputNodes], -1, 1);
  }

  // Feedforward function to make predictions
  predict(inputArray) {
    // Convert input array to a matrix
    const inputMatrix = math.matrix(inputArray).reshape([this.inputNodes, 1]);

    // Calculate the hidden layer outputs
    const hiddenInputs = math.multiply(this.weightsInputHidden, inputMatrix);
    const hiddenOutputs = math.map(hiddenInputs, sigmoid);

    // Calculate the output layer outputs
    const finalInputs = math.multiply(this.weightsHiddenOutput, hiddenOutputs);
    const finalOutputs = math.map(finalInputs, sigmoid);

    return finalOutputs.valueOf();
  }

  // Train the network using backpropagation
  train(inputArray, targetArray, learningRate = 0.1) {
    // First, perform feedforward to get the output
    const inputMatrix = math.matrix(inputArray).reshape([this.inputNodes, 1]);
    const hiddenInputs = math.multiply(this.weightsInputHidden, inputMatrix);
    const hiddenOutputs = math.map(hiddenInputs, sigmoid);
    const finalInputs = math.multiply(this.weightsHiddenOutput, hiddenOutputs);
    const finalOutputs = math.map(finalInputs, sigmoid);

    // Calculate the output errors (target - output)
    const targetMatrix = math.matrix(targetArray).reshape([this.outputNodes, 1]);
    const outputErrors = math.subtract(targetMatrix, finalOutputs);

    // Calculate the hidden errors by backpropagating the output errors
    const hiddenErrors = math.multiply(math.transpose(this.weightsHiddenOutput), outputErrors);

    // Update the weights between hidden and output layers using gradient descent
    const gradientOutput = math.map(finalOutputs, sigmoidDerivative);
    const deltaOutput = math.dotMultiply(math.dotMultiply(outputErrors, gradientOutput), learningRate);
    this.weightsHiddenOutput = math.add(this.weightsHiddenOutput, math.multiply(deltaOutput, math.transpose(hiddenOutputs)));

    // Update the weights between input and hidden layers using gradient descent
    const gradientHidden = math.map(hiddenOutputs, sigmoidDerivative);
    const deltaHidden = math.dotMultiply(math.dotMultiply(hiddenErrors, gradientHidden), learningRate);
    this.weightsInputHidden = math.add(this.weightsInputHidden, math.multiply(deltaHidden, math.transpose(inputMatrix)));
  }
}

// Example usage
const nn = new NeuralNetwork(2, 4, 1);

// Train the network with sample data
for (let i = 0; i < 10000; i++) {
  nn.train([0, 0], [0]);
  nn.train([0, 1], [1]);
  nn.train([1, 0], [
