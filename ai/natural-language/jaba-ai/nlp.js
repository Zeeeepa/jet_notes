const natural = require("natural");
// Create a tokenizer
const tokenizer = new natural.WordTokenizer();
// Create a classifier
const classifier = new natural.BayesClassifier();

const train = () => {
  // Add training data
  classifier.addDocument("What is my brand?", "get_brand");
  classifier.addDocument("What is my personal brand?", "get_brand");
  classifier.addDocument("What is my brand identity?", "get_brand");
  classifier.addDocument("How do I define my brand?", "get_brand");
  classifier.addDocument("How can I improve my brand?", "improve_brand");
  classifier.addDocument(
    "What should I do to build a better brand?",
    "improve_brand"
  );
  classifier.addDocument("How can I become more impactful?", "improve_impact");
  classifier.addDocument(
    "What can I do to increase my impact?",
    "improve_impact"
  );
  classifier.addDocument("How can I stay NIL-compliant?", "stay_compliant");
  classifier.addDocument(
    "What are the NIL compliance rules?",
    "stay_compliant"
  );

  // Train the classifier
  classifier.train();
};

const run = () => {
  const argsMsg = process.argv.slice(2).join(" ").trim();

  // Process user input
  const input = argsMsg || "What is my brand?";
  const tokens = tokenizer.tokenize(input.toLowerCase());

  // Stem tokens using PorterStemmer
  const stemmedTokens = tokens.map((token) =>
    natural.PorterStemmer.stem(token)
  );

  // Classify user input and get response
  const label = classifier.classify(stemmedTokens.join(" "));
  let response;

  console.log("nlp:", { label, input, tokens, stemmedTokens });

  switch (label) {
    case "get_brand":
      response =
        "Your brand is the image you project to the world. It includes your values, personality, and what makes you unique.";
      break;
    case "improve_brand":
      response =
        "To improve your brand, focus on being authentic, consistent, and building relationships with your audience.";
      break;
    case "improve_impact":
      response =
        "To increase your impact, focus on creating valuable content, engaging with your audience, and collaborating with other influencers.";
      break;
    case "stay_compliant":
      response =
        "To stay NIL-compliant, make sure you don't accept any compensation for your name, image, or likeness, and don't promote any product or service that conflicts with your university's values or policies.";
      break;
    default:
      response = "Sorry, I didn't understand your query. Please try again.";
  }

  // Output response
  console.log(response);
};

train();
run();
