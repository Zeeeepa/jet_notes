const NeuralNetwork = require("./NeuralNetwork");
const math = require("mathjs");

describe("NeuralNetwork", () => {
  const inputnodes = 784;
  const hiddennodes = 100;
  const outputnodes = 10;
  const learningrate = 0.1;
  const nn = new NeuralNetwork(
    inputnodes,
    hiddennodes,
    outputnodes,
    learningrate
  );

  describe("forward", () => {
    it("should return an output of shape [outputnodes, 1]", () => {
      const input = Array(inputnodes).fill(0);
      const output = nn.forward(input);
      expect(output.size()).toEqual([outputnodes, 1]);
    });
  });

  describe("backward", () => {
    it("should update the cache with expected values", () => {
      const target = Array(outputnodes).fill(0);
      nn.backward(target);
      expect(nn.cache.input.size()).toEqual([inputnodes, 1]);
      expect(nn.cache.h_out.size()).toEqual([hiddennodes, 1]);
      expect(nn.cache.actual.size()).toEqual([outputnodes, 1]);
      expect(nn.cache.dwho.size()).toEqual([outputnodes, hiddennodes]);
      expect(nn.cache.dwih.size()).toEqual([hiddennodes, inputnodes]);
      expect(nn.cache.loss).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("should update the weights of the network", () => {
      nn.update();
      expect(nn.wih).not.toEqual(nn.dwih);
      expect(nn.who).not.toEqual(nn.dwho);
    });
  });

  describe("predict", () => {
    it("should return an output of shape [outputnodes, 1]", () => {
      const input = Array(inputnodes).fill(0);
      const output = nn.predict(input);
      expect(output.size()).toEqual([outputnodes, 1]);
    });
  });

  describe("train", () => {
    it("should update the weights of the network and the cache", () => {
      const input = Array(inputnodes).fill(0);
      const target = Array(outputnodes).fill(0);
      const nn = new NeuralNetwork(
        inputnodes,
        hiddennodes,
        outputnodes,
        learningrate
      );
      nn.train(input, target);

      expect(nn.wih).not.toEqual(nn.dwih);
      expect(nn.who).not.toEqual(nn.dwho);
      expect(nn.cache.input.size()).toEqual([inputnodes, 1]);
      expect(nn.cache.h_out.size()).toEqual([hiddennodes, 1]);
      expect(nn.cache.actual.size()).toEqual([outputnodes, 1]);
      expect(nn.cache.dwho.size()).toEqual([outputnodes, hiddennodes]);
      expect(nn.cache.dwih.size()).toEqual([hiddennodes, inputnodes]);
      expect(nn.cache.loss).toHaveLength(1);
    });
  });

  describe("train - single digits", () => {
    let nn;
    beforeEach(() => {
      nn = new NeuralNetwork(10, 16, 1, 0.1);
    });

    it("should update the weights of the network and the cache for single digit inputs", () => {
      const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const target = [0.9];
      nn.train(input, target);
      expect(nn.wih).not.toEqual(nn.dwih);
      expect(nn.who).not.toEqual(nn.dwho);
      expect(nn.cache.input.size()).toEqual([10, 1]);
      expect(nn.cache.h_out.size()).toEqual([16, 1]);
      expect(nn.cache.actual.size()).toEqual([1, 1]);
      expect(nn.cache.dwho.size()).toEqual([1, 16]);
      expect(nn.cache.dwih.size()).toEqual([16, 10]);
      expect(nn.cache.loss).toHaveLength(1);
    });

    it("should predict the untrained correct output for single digit inputs", () => {
      const input = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0]; // "3"
      const output = nn.predict(input);
      const accuracy = output._data[0][0];
      expect(accuracy).toBeGreaterThanOrEqual(0.6);
    });

    it("should predict the untrained wrong output for single digit inputs", () => {
      const input = [0, 0, 0, 1, 0, 0, 0, 0, 0, 2];
      const output = nn.predict(input);
      const accuracy = output._data[0][0];
      expect(accuracy).toBeLessThan(0.6);
    });
  });
});
