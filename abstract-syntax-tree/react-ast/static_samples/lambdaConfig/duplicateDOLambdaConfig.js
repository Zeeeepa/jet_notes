const config = {
  queryConfig1: {
    operationType: "Query",
    type: "data-object",
    fieldName: "getDuplicateFields",
    urlPath: "/data_object/duplicateFields",
    params: {
      groupId: "groupId",
    },
    response: {
      id: "dataObjectId",
      fields: "fields || []",
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      groupId: "ci_aa82f4c085572d46",
    },
  },
  queryConfig2: {
    operationType: "Query",
    type: "data-object",
    fieldName: "listDuplicateDataObjects",
    urlPath: "/data_object/duplicateFields/check",
    imports: {
      "../utils/array": {
        identifiers: ["flattenArrayByKey"],
      },
    },
    params: (prefix) => {
      return `
        {
          groupId: ${prefix}.groupId,
          ...JSON.parse(${prefix}.valueJson)
        }
      `.trim();
    },
    response: (result) => {
      const arr = flattenArrayByKey(result, "contactId");

      return arr.map((item) => {
        return {
          doItemId: item.dataObjectId,
          contactId: item.contactId,
          displayFields: Object.entries(item).reduce((acc, [key, value]) => {
            const accArr = [...acc];

            if (!["dataObjectId", "contactId"].includes(key)) {
              accArr.push({
                fieldId: key,
                value,
              });
            }

            return accArr;
          }, []),
        };
      });
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      groupId: "ci_053925e4fa66d80a",
      valueJson: JSON.stringify({
        field_0fe8a810a150adcf: "Sample 1",
        field_6651292408e9b54d: "1111",
        field_6875bc0d288aee32: "Type 1",
        field_b198309535a9dd98: "123",
        field_e2808ec8a2500999: "Main St",
      }),
    },
  },
  mutationConfig1: {
    operationType: "Mutation",
    httpMethod: "POST",
    type: "data-object",
    fieldName: "saveDataObjectDuplicateField",
    urlPath: "/data_object/duplicateFields",
    params: {
      dataObjectId: "id",
      fields: "fields",
    },
    response: {
      id: "dataObjectId",
      fields: "fields || []",
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "ci_aa82f4c085572d46",
      fields: ["field_73423e513813c3f0", "field_3f4586fe2480c187"],
    },
  },
};

// export const lambdaConfig = config.queryConfig1;
export const lambdaConfig = config.queryConfig2;
// export const lambdaConfig = config.mutationConfig1;

export const allFieldNames = [
  "getDuplicateFields",
  "listDuplicateDataObjects",
  "saveDataObjectDuplicateField",
];
