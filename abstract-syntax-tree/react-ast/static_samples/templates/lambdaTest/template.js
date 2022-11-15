const lambdaFunction = require("templateLambdaPath");

const payload = {
  request: {
    headers: templateHeaders,
  },
  arguments: templateArguments,
};

lambdaFunction(payload, {}, (err, res) => {
  console.log(JSON.stringify(res));
});
