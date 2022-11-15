const http = require("../utils/http");
const envConfig = require("../config/envConfig");
const getJsonResponse = require("../utils/getJsonResponse");
const getRequestArgs = require("../helpers/getRequestArgs");
const { transformResponse } = require("./queryEmailTemplateLambda");

module.exports.postEmailActionTemplate = getRequestArgs(
  sendPostEmailActionTemplate
);

async function sendPostEmailActionTemplate(
  { "app-name": appName, "app-api-key": apiKey, "session-id": sessionName },
  {
    id,
    title,
    compiledEmailHTML,
    emailHTML,
    emailCSS,
    templateHTML,
    templateCSS,
    type,
    templateGroupId,
    userId,
  }
) {
  const body = {
    api_key: apiKey,
    sessionName: sessionName,
    Title: title,
    CompiledEmailHTML: compiledEmailHTML,
    EmailHTML: emailHTML,
    EmailCSS: emailCSS,
    TemplateHTML: templateHTML,
    TemplateCSS: templateCSS,
    Type: type,
    TemplateGroupId: templateGroupId,
    Global: !userId ? "yes" : "no",
    UserContactId: userId,
  };
  let url = `https://${appName}.${envConfig.apiDomain}/rest/v1/automation/emailTemplate`;
  if (id) {
    url += `/${id}`;
  }
  const response = await http.post(url, body);
  const json = await getJsonResponse(response);

  return transformResponse(json);
}
