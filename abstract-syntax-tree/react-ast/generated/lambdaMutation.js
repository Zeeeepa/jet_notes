const http = require("../utils/http");
const envConfig = require("../config/envConfig");
const getJsonResponse = require("../utils/getJsonResponse");
const getRequestArgs = require("../helpers/getRequestArgs");
const { transformResponse } = require("./queryEmailTemplateLambda");

module.exports = getRequestArgs(apiCall);

async function apiCall(
  { "app-name": appName, "app-api-key": apiKey, "session-id": sessionName },
  params
) {
  const body = {
    api_key: apiKey,
    sessionName: sessionName,
    Title: params.title,
    CompiledEmailHTML: params.compiledEmailHTML,
    EmailHTML: params.emailHTML,
    EmailCSS: params.emailCSS,
    TemplateHTML: params.templateHTML,
    TemplateCSS: params.templateCSS,
    Type: params.type,
    TemplateGroupId: params.templateGroupId,
    Global: !params.userId ? "yes" : "no",
    UserContactId: params.userId,
  };
  let url = `https://${appName}.${envConfig.apiDomain}/rest/v1/email/template`;

  if (id) {
    url += `/${id}`;
  }
  const response = await http.post(url, body);
  const json = await getJsonResponse(response);

  return transformResponse(json);
}
