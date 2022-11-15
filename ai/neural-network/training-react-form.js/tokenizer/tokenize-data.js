const MAX_LENGTH = 100;
const tokenizer = new Tokenizer();

// Preprocessing the inputs
tokenizer.fitOnTexts(data.inputs);
const inputSequences = tokenizer.textsToSequences(data.inputs);
const inputData = padSequences(inputSequences, MAX_LENGTH);

// Preprocessing the outputs
tokenizer.fitOnTexts(data.outputs);
const outputSequences = tokenizer.textsToSequences(data.outputs);
const outputData = padSequences(outputSequences, MAX_LENGTH);
