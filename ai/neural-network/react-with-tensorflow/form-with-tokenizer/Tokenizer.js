/**
 * Ideas based on OpenAI ChatGPT
 * https://chat.openai.com/chat/0ab054c4-e39f-44c4-8e5a-67b13d2927c3
 */

class Tokenizer {
  constructor({
    maxSeqLength = 100,
    caseInsensitive = true,
    preventNonWord = true,
    withPadding = true,
  } = {}) {
    this.vocab = {};
    this.vocabSize = 0;
    this.invVocab = {};
    this.maxSeqLength = maxSeqLength;
    this.caseInsensitive = caseInsensitive;
    this.preventNonWord = preventNonWord;
    this.withPadding = withPadding;
  }

  fitOnTexts(texts) {
    for (let text of texts) {
      if (this.caseInsensitive) {
        text = text.toLowerCase();
      }
      let regex = /\w+/g;
      if (!this.preventNonWord) {
        regex = /\w+|[^\w\s]+/g;
      }
      let tokens = text.match(regex);
      for (let token of tokens) {
        if (!(token in this.vocab)) {
          this.vocab[token] = this.vocabSize++;
          this.invVocab[this.vocabSize - 1] = token;
        }
      }
    }
  }

  textsToSequences(texts) {
    let sequences = [];
    for (let text of texts) {
      let tokens = text.split(/\s+/);
      let tokenIndices = tokens.map((token) => this.vocab[token]);
      sequences.push(tokenIndices);
    }
    return sequences;
  }

  textsToSequences(texts) {
    let sequences = [];
    for (let text of texts) {
      if (this.caseInsensitive) {
        text = text.toLowerCase();
      }
      let regex = /\w+/g;
      if (!this.preventNonWord) {
        regex = /\w+|[^\w\s]+/g;
      }
      let tokens = text.match(regex);
      let tokenIndices = tokens.map((token) => this.vocab[token]);
      if (this.withPadding) {
        tokenIndices = this.padSequences([tokenIndices], this.maxSeqLength);
        sequences = sequences.concat(tokenIndices);
      } else {
        sequences.push(tokenIndices);
      }
    }
    return sequences;
  }

  padSequences(sequences, maxSeqLength) {
    let paddedSequences = [];
    for (let seq of sequences) {
      let paddedSeq = seq;
      let padding = maxSeqLength - seq.length;
      for (let i = 0; i < padding; i++) {
        paddedSeq.push(0);
      }
      paddedSequences.push(paddedSeq);
    }
    return paddedSequences;
  }

  sequencesToTexts(sequences) {
    let texts = [];
    for (let seq of sequences) {
      let text = seq.map((index) => this.invVocab[index]).join(" ");
      texts.push(text);
    }
    return texts;
  }
}

const sampleUsage = () => {
  // Create an instance of the Tokenizer class
  let tokenizer = new Tokenizer((maxSeqLength = 50));

  // Fit the tokenizer on some texts
  let texts = [
    "Hello, this is a sample text for tokenization.",
    "Another sample text for tokenization.",
  ];
  tokenizer.fitOnTexts(texts);

  // Use the tokenizer to convert texts to sequences
  let newTexts = [
    "A new sample text for tokenization.",
    "Yet another sample text.",
  ];
  let sequences = tokenizer.textsToSequences(newTexts);
  console.log(sequences);

  // Use the tokenizer to convert sequences back to texts
  let originalTexts = tokenizer.sequencesToTexts(sequences);
  console.log(originalTexts);
};

module.exports = Tokenizer;

/**
 * It uses the `match()` method of javascript string object, which returns an
 * array of all matches of a regular expression against a string instead of
 * `split()`
 *
 * The `fitOnTexts` method takes a list of texts as input and creates a
 * vocabulary of unique tokens by iterating through the texts and adding new
 * tokens to the vocabulary. The vocabulary is represented as an object that
 * maps each token to a unique index.
 *
 * The `textsToSequences` method takes a list of texts as input and converts
 * them into sequences of token indices by splitting the texts into tokens and
 * mapping each token to its corresponding index in the vocabulary. The
 * resulting sequences are returned as an array of arrays, where each inner
 * array represents a sequence of token indices for a given text.
 *
 * The `padSequences` method is used by passing the sequences coming from the
 * `textsToSequences` method. This is to pad them to the maximum length
 * specified in the constructor. This allows the sequences to be of the same
 * length, which is a requirement for many neural network models.
 *
 * The `sequencesToTexts` method takes a list of sequences as input and converts
 * them back to texts by mapping the indices in the sequences to their
 * corresponding tokens in the vocabulary.
 *
 *
 * As you can see here, the `preventNonWord` flag is used to check whether the
 * tokenizing should only include word characters or not. If the flag is set to
 * true, the regular expression used for tokenization only matches word
 * characters (/\w+/g). If the flag is set to false, the regular expression used
 * for tokenization matches both word characters and non-word characters
 * (/\w+|[^\w\s]+/g).
 */
