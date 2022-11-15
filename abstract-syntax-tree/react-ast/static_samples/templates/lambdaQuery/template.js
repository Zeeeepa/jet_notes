const querystring = require("querystring");
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
  const queryParams = Object.assign(
    {
      api_key: apiKey,
      sessionName: sessionName,
    },
    templateParams
  );
  const query = querystring.stringify(queryParams);

  const url = `https://${appName}.${envConfig.apiDomain}/templateApiPath?${query}`;

  const response = await http.get(url);

  const result = await getJsonResponse(response);

  return transformResponse(toCamelCaseKeys(result), params);
}

const transformResponse = templateResponse;
