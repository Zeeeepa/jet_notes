const querystring = require("querystring");
const http = require("../utils/http");
const envConfig = require("../config/envConfig");
const getJsonResponse = require("../utils/getJsonResponse");
const getRequestArgs = require("../helpers/getRequestArgs");

module.exports = getRequestArgs(apiCall);

async function apiCall(
  { "app-name": appName, "app-api-key": apiKey, "session-id": sessionName },
  params
) {
  const queryParams = {
    api_key: apiKey,
    sessionName: sessionName,
    groupId: params.groupId,
  };
  const query = querystring.stringify(queryParams);

  const url = `https://${appName}.${envConfig.apiDomain}/rest/v1/data_object/duplicateFields?${query}`;

  const response = await http.get(url);

  const result = await getJsonResponse(response);

  return transformResponse(result);
}

function transformResponse(result) {
  return {
    id: result.dataObjectId,
    fields: result.fields || [],
  };
}
