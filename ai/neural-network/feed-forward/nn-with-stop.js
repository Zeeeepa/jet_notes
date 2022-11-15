const math = require("mathjs");
const NeuralNetwork = require("./NeuralNetwork");

/** these short cuts of mathJS functions make our life easier */
const sum = math.sum;

/* neural network's hyper parameters */
const inputnodes = 784;
const hiddennodes = 100;
const outputnodes = 10;
const learningrate = 0.2;
const threshold = 0.5;
let iter = 0;
const iterations = 5;

/* path to the data sets */
const trainingDataPath = "./mnist/mnist_train_100.csv";
const testDataPath = "./mnist/mnist_test_10.csv";
const weightsFilename = "weights.json";
const savedWeightsPath = `./dist/${weightsFilename}`;

/* these constants will be filled during data loading and preparation */
const trainingData = [];
const trainingLabels = [];
const testData = [];
const testLabels = [];
const savedWeights = {};

/* states after how many trained samples a log message should appear */
const printSteps = 1000;

/* save all setTimeouts to clear them when training or testing should be aborted */
const timeouts = [];

/* save references to the stop function to clear up event listeners when training or testing is aborted and restarted */
const stopTraining = () => {
  stop("training", "Aborted training.", true);
};
const stopTesting = () => {
  stop("esting", "Aborted testing.", false);
};

/* button labels for different states: either in training/testing or aborted */
const trainButtonLabel = "Train";
const testButtonLabel = "Test";
const stopButtonLabel = "Stop!";

let myNN;

window.onload = async () => {
  /* Instantiate an entity from the NeuralNetwork class */
  myNN = new NeuralNetwork(inputnodes, hiddennodes, outputnodes, learningrate);

  trainButton.disabled = true;
  testButton.disabled = true;
  loadWeightsButton.disabled = true;

  status.innerHTML = "Loading the data sets. Please wait ...<br>";

  /* get all the data set files and do the preparations */

  const trainCSV = await loadData(trainingDataPath, "CSV");

  if (trainCSV) {
    prepareData(trainCSV, trainingData, trainingLabels);
    status.innerHTML += "Training data successfully loaded...<br>";
  }

  const testCSV = await loadData(testDataPath, "CSV");

  if (testCSV) {
    prepareData(testCSV, testData, testLabels);
    status.innerHTML += "Test data successfully loaded...<br>";
  }

  if (!trainCSV || !testCSV) {
    status.innerHTML +=
      "Error loading train/test data set. Please check your file path!";
    return;
  }

  trainButton.disabled = false;
  testButton.disabled = false;

  const weightsJSON = await loadData(savedWeightsPath, "JSON");

  /* if there is a saved JSON file with pretrained weights existing, save the content in the weightsJSON constant */
  if (weightsJSON) {
    savedWeights.wih = weightsJSON.wih;
    savedWeights.who = weightsJSON.who;
    loadWeightsButton.disabled = false;
  }

  status.innerHTML += "Ready.<br><br>";
};

async function loadData(path, type) {
  try {
    const result = await fetch(path, {
      mode: "no-cors",
    });

    switch (type) {
      case "CSV":
        return await result.text();
        break;
      case "JSON":
        return await result.json();
        break;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

function prepareData(rawData, target, labels) {
  rawData = rawData.split("\n"); // create an array where each element correspondents to one line in the CSV file
  rawData.pop(); // remove the last element which is empty because it refers to a last blank line in the CSV file

  rawData.forEach((current) => {
    let sample = current.split(",").map((x) => +x); // create an array where each element has a grey color value

    labels.push(sample[0]); // extract the first element of the sample which is (mis)used as the label
    sample.shift(); // remove the first element

    sample = NeuralNetwork.normalizeData(sample);

    target.push(sample);
  });
}

function train(_, inTraining = false) {
  trainButton.innerHTML = stopButtonLabel;

  if (!inTraining) {
    trainButton.removeEventListener("click", train);
    trainButton.addEventListener("click", stopTraining);
  }

  testButton.disabled = true;
  loadWeightsButton.disabled = true;
  download.innerHTML = "";

  if (iter < iterations) {
    iter++;
    status.innerHTML += "Starting training ...<br>";
    status.innerHTML += "Iteration " + iter + " of " + iterations + "<br>";

    trainingData.forEach((current, index) => {
      timeouts.push(
        setTimeout(() => {
          /* create one-hot encoding of the label */
          const label = trainingLabels[index];
          const oneHotLabel = Array(10).fill(0);
          oneHotLabel[label] = 0.99;

          myNN.train(current, oneHotLabel);

          /* check if the defined interval for showing a message on the training progress is reached */
          if (index > 0 && !((index + 1) % printSteps)) {
            status.innerHTML += `finished  ${index + 1}  samples ... <br>`;
          }

          /* check if the end of the training iteration is reached */
          if (index === trainingData.length - 1) {
            status.innerHTML += `Loss:  ${
              sum(myNN.cache.loss) / trainingData.length
            }<br><br>`;
            myNN.cache.loss = [];

            test("", true); // true to signal "test" that it is called from within training
          }
        }, 0)
      );
    });
  }
}

function test(_, inTraining = false) {
  // skip the first parameter as it includes data from the event listener which we don't need here
  if (!inTraining) {
    testButton.innerHTML = stopButtonLabel;
    testButton.removeEventListener("click", test);
    testButton.addEventListener("click", stopTesting);
    trainButton.disabled = true;
  }

  loadWeightsButton.disabled = true;

  status.innerHTML += "Starting testing ...<br>";

  let correctPredicts = 0;
  testData.forEach((current, index) => {
    timeouts.push(
      setTimeout(() => {
        const actual = testLabels[index];

        const predict = formatPrediction(myNN.predict(current));
        predict === actual ? correctPredicts++ : null;

        /* check if the defined interval for showing a message on the testing progress is reached */
        if (index > 0 && !((index + 1) % printSteps)) {
          status.innerHTML += " finished " + (index + 1) + " samples ...<br>";
        }

        /* check if testing is complete */
        if (index >= testData.length - 1) {
          status.innerHTML +=
            "Accuracy: " +
            Math.round((correctPredicts / testData.length) * 100) +
            " %<br><br>";

          /* check if training is complete */
          if (iter + 1 > iterations) {
            createDownloadLink();
            enableAllButtons();
            resetButtons("training");
            status.innerHTML += "Finished training.<br><br>";
            iter = 0;
          } else if (inTraining) {
            // if test is called from within training and the training is not complete yet, continue training
            train("", true);
          } else {
            enableAllButtons();
            resetButtons("testing");
          }
        }
      }, 0)
    );
  });
}

function predict() {
  /* resize the canvas to the training data image size  */
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0, 150, 150, 0, 0, 28, 28);

  /* convert the canvas image */
  const img = tempCtx.getImageData(0, 0, 28, 28);

  /* remove the alpha channel and convert to grayscale */
  let sample = [];
  for (let i = 0, j = 0; i < img.data.length; i += 4, j++) {
    sample[j] = (img.data[i + 0] + img.data[i + 1] + img.data[i + 2]) / 3;
  }

  img.data = NeuralNetwork.normalizeData(img.data);

  const predict = formatPrediction(myNN.predict(sample));
  prediction.innerHTML = predict;
}

function formatPrediction(prediction) {
  const flattened = prediction.toArray().map((x) => x[0]);

  /* get the index of the highest number in the flattened array */
  return flattened.indexOf(Math.max(...flattened));
}

function loadWeights() {
  myNN.wih = savedWeights.wih;
  myNN.who = savedWeights.who;
  status.innerHTML += "Weights successfully loaded.";
}

function createDownloadLink() {
  const wih = myNN.wih.toArray();
  const who = myNN.who.toArray();
  const weights = { wih, who };
  download.innerHTML = `<a download="${weightsFilename}" id="downloadLink" href="data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(weights)
  )}">Download model weights</a>`;
}

/* UI helper functions */

function enableAllButtons() {
  trainButton.disabled = false;
  testButton.disabled = false;
  loadWeightsButton.disabled = false;
}

function stop(mode, message = "", downloadLink = false) {
  timeouts.forEach((e) => clearTimeout(e));
  timeouts.splice(0, timeouts.length);
  status.innerHTML += `${message}<br><br>`;
  iter = 0;

  if (mode === "training") {
    resetButtons("training");
  } else {
    resetButtons("testing");
  }

  enableAllButtons();

  if (downloadLink) {
    createDownloadLink();
  }
}

function resetButtons(mode) {
  if (mode === "training") {
    trainButton.removeEventListener("click", stopTraining);
    trainButton.addEventListener("click", train);
    trainButton.innerHTML = trainButtonLabel;
  } else {
    testButton.removeEventListener("click", stopTesting);
    testButton.addEventListener("click", test);
    testButton.innerHTML = testButtonLabel;
  }
}
