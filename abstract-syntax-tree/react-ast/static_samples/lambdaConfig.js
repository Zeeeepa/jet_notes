import map from "lodash/map";

const config = {
  listToursConfig: {
    operationType: "Query",
    type: "contact",
    fieldName: "listTours",
    urlPath: "/tour/get",
    params: {},
    response: (result) => {
      return result.tours;
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_9f57a46b105031ca",
    },
    testArgs: {},
  },
  postTourConfig: {
    operationType: "Mutation",
    httpMethod: "POST",
    type: "contact",
    fieldName: "postTour",
    urlPath: "/tour/save",
    params: {
      id: "id",
      title: "title",
      description: "description",
      queryId: "queryId",
      ownerId: "ownerId",
      status: "status",
      startDate: "startDate",
      endDate: "endDate",
      contacts: "contacts",
    },
    response: (result) => {
      return result;
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "1",
      title: "Tour 1",
      description: "Updated 2",
      api_key: "1552679244144731",
      queryId: "qry_59decf56a65838a7",
      ownerId: "554840",
      status: "Active",
      startDate: "2023-05-09 11:00:00",
      endDate: "2023-05-13 08:00:00",
      contacts: [
        {
          id: "3",
          contactId: "1000003",
          excluded: false,
          visitDate: "2023-05-11 10:00:00",
          address: "2 Lombard St, San Francisco, CA 94111, USA",
          coordinates: {
            latitude: "37.78697",
            longitude: "-122.399677",
          },
        },
        {
          id: "4",
          contactId: "1000000",
          excluded: true,
          visitDate: "2023-05-10 10:00:00",
          address: "3 Lombard St, San Francisco, CA 94111, USA",
          coordinates: {
            latitude: "37.78697",
            longitude: "-122.399677",
          },
        },
      ],
    },
  },
  deleteTourConfig: {
    operationType: "Mutation",
    httpMethod: "DELETE",
    type: "contact",
    fieldName: "deleteTour",
    urlPath: (prefix) => {
      return "/tour/delete/${" + prefix + ".id}";
    },
    params: {
      id: "id",
    },
    response: (result) => {
      return {
        id: result.id,
        success: true,
      };
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "4",
    },
  },
};

export const lambdaConfig = config.postTourConfig;

export const allFieldNames = map(Object.values(config), "fieldName");
