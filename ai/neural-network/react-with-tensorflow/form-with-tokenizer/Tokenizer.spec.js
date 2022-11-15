const Tokenizer = require("./Tokenizer");

describe("Tokenizer", () => {
  describe("#fitOnTexts()", () => {
    it("should create a vocabulary of unique tokens", () => {
      let tokenizer = new Tokenizer();
      let texts = [
        "Hello, this is a sample text for tokenization.",
        "Another sample text for tokenization.",
      ];
      tokenizer.fitOnTexts(texts);
      expect(Object.keys(tokenizer.vocab).length).toBe(9);
    });
  });

  describe("#textsToSequences()", () => {
    it("should convert texts to sequences of token indices", () => {
      let tokenizer = new Tokenizer();
      let texts = [
        "Hello, this is a sample text for tokenization.",
        "Another sample text for tokenization.",
      ];
      tokenizer.fitOnTexts(texts);
      let newTexts = [
        "A new sample text for tokenization.",
        "Yet another sample text.",
      ];
      let sequences = tokenizer.textsToSequences(newTexts);
      expect(sequences.length).toBe(2);
      expect(sequences[0].length).toBe(100);
      expect(sequences[1].length).toBe(100);
    });
  });

  describe("#padSequences()", () => {
    it("should pad sequences with zeros", () => {
      let maxSeqLength = 50;
      let tokenizer = new Tokenizer();
      let sequences = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9],
      ];
      let paddedSequences = tokenizer.padSequences(sequences, maxSeqLength);
      expect(paddedSequences[0].length).toBe(50);
      expect(paddedSequences[1].length).toBe(50);
      expect(paddedSequences[0][paddedSequences[0].length - 1]).toBe(0);
      expect(paddedSequences[1][paddedSequences[1].length - 1]).toBe(0);
    });
  });

  describe("#sequencesToTexts()", () => {
    it("should convert sequences of token indices back to texts", () => {
      let tokenizer = new Tokenizer({
        caseInsensitive: false,
        preventNonWord: false,
        withPadding: false,
      });
      let texts = [
        "Hello, this is a sample text for tokenization.",
        "Another sample text for tokenization.",
      ];
      tokenizer.fitOnTexts(texts);
      console.log("fitOnTexts", tokenizer.vocab);
      let newTexts = [
        "A new sample text for tokenization.",
        "Yet another sample text.",
      ];
      let sequences = tokenizer.textsToSequences(newTexts);
      let originalTexts = tokenizer.sequencesToTexts(sequences);
      expect(originalTexts.length).toBe(2);
      expect(originalTexts[0]).toBe("A new sample text for tokenization.");
      expect(originalTexts[1]).toBe("Yet another sample text.");
    });
  });
});
