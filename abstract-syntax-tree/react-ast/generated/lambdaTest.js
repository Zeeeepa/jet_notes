const lambdaFunction = require("./generated/lambdaQuery.js");

const payload = {
  request: {
    headers: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
  },
  arguments: {
    groupId: "ci_aa82f4c085572d46",
  },
};

lambdaFunction(payload, {}, (err, res) => {
  console.log(JSON.stringify(res));
});
