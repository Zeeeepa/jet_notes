import map from "lodash/map";

const config = {
  listContactHistoryConfig: {
    operationType: "Query",
    type: "history",
    fieldName: "listContactHistory",
    urlPath: "/timeline/history/${params.contactId}",
    params: {
      contactId: "contactId",
      limit: "limit",
      page: "page",
    },
    response: (result) => {
      return result.items.map((item) => {
        return {
          date: item.date,
          type: item.type,
        };
      });
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
    },
    testArgs: {
      contactId: "554840",
    },
  },
};

export const lambdaConfig = config.listContactHistoryConfig;

export const allFieldNames = map(Object.values(config), "fieldName");
