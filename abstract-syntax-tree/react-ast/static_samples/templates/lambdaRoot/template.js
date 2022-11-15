module.exports.templateType = handleRequest;

function handleRequest(...params) {
  const event = params[0];
  const callback = params[2];

  console.log(
    "Lambda handleRequest",
    event.info.fieldName,
    event.info.parentTypeName,
    event
  );

  const lambdaFunctionMapping = {
    templateLambdaMapping,
  };
  const lambdaFunction = lambdaFunctionMapping[event.info.fieldName];

  if (lambdaFunction) {
    lambdaFunction(...params);
  } else {
    callback(new UnknownFieldException(event.info.fieldName), null);
  }
}

class UnknownFieldException extends Error {
  constructor(eventFieldName) {
    super("Unknown field: " + eventFieldName);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownFieldException);
    }
    this.name = "UnknownFieldException";
  }
}
