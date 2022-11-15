const http = require("../utils/http");
const envConfig = require("../config/envConfig");
const getJsonResponse = require("../utils/getJsonResponse");
const getRequestArgs = require("../helpers/getRequestArgs");
const { toCamelCaseKeys } = require("../utils/object");
templateImports;

module.exports = getRequestArgs(apiCall);

async function apiCall(
  { "app-name": appName, "app-api-key": apiKey, "session-id": sessionName },
  params
) {
  const body = Object.assign(
    {
      api_key: apiKey,
      sessionName: sessionName,
    },
    templateParams
  );
  let url = `https://${appName}.${envConfig.apiDomain}/templateApiPath`;

  const response = await http.templateMethod(url, body);
  const result = await getJsonResponse(response);

  return transformResponse(toCamelCaseKeys(result), params);
}

const transformResponse = templateResponse;
