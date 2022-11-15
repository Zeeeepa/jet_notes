import map from "lodash/map";

const config = {
  listPriceListsConfig: {
    operationType: "Query",
    type: "price-list-generator",
    fieldName: "listPriceLists",
    urlPath: "/pricelist/type/all",
    params: {},
    response: (result) => {
      return result.data.map((item) => {
        return {
          id: item.Id,
          title: item.Title,
          description: item.Description,
          status: item.Status,
          type: item.Type,
          meta: item.Meta,
          mergeTag: item.MergeTag,
          shareLink: item.ShareLink,
          embedCode: item.EmbedCode,
          created: item.Created,
          updated: item.Updated,
        };
      });
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {},
  },
  getPriceListConfig: {
    operationType: "Query",
    type: "price-list-generator",
    fieldName: "getPriceList",
    urlPath: "/pricelist/item",
    imports: {
      "../utils/object": {
        identifiers: ["toCamelCaseKeys"],
      },
      "lodash/flatten": {
        default: "flatten",
      },
    },
    params: {
      id: "id",
    },
    response: (result, params) => {
      let resultItem = result.find((item) => item.Id === params.id);

      resultItem = {
        ...resultItem,
        categories: resultItem.categories.map((category) => {
          return {
            ...category,
            items: flatten(category.items),
          };
        }),
      };

      return toCamelCaseKeys(resultItem);
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "2",
    },
  },
  listCategoriesConfig: {
    operationType: "Query",
    type: "price-list-generator",
    fieldName: "listPriceListCategories",
    urlPath: "/pricelist/cat",
    params: {},
    response: (result) => {
      return result.data.map((item) => {
        const subCategories = item.subCategory?.data || [];

        return {
          id: item.id,
          listId: item.groupId,
          title: item.title,
          created: item.created,
          updated: item.updated,
          subCategories: subCategories.map((subCategory) => ({
            id: subCategory.id,
            title: subCategory.title,
          })),
        };
      });
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {},
  },
  savePriceListConfig: {
    operationType: "Mutation",
    httpMethod: "POST",
    type: "price-list-generator",
    fieldName: "savePriceList",
    urlPath: "/pricelist/type",
    params: {
      id: "id",
      title: "name",
      description: "description",
      status: "status",
      type: "type",
      meta: "meta",
    },
    response: (result) => {
      return {
        id: result.id,
        name: result.title,
        description: result.description,
        status: result.status,
        type: result.type,
        meta: result.meta,
        created: result.created,
        updated: result.updated,
      };
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "7",
      title: "Test 2 Edited 1",
      type: "Full Formula",
      description: "test",
      status: "Active",
      meta: "{test: 1}",
    },
  },
  savePriceListItemConfig: {
    operationType: "Mutation",
    httpMethod: "POST",
    type: "price-list-generator",
    fieldName: "savePriceListItem",
    urlPath: "/pricelist/item",
    params: {
      id: "id",
      title: "name",
      description: "description",
      status: "status",
      type: "type",
      meta: "meta",
    },
    response: (result) => {
      return {
        id: result.id,
        name: result.title,
        description: result.description,
        status: result.status,
        type: result.type,
        meta: result.meta,
        created: result.created,
        updated: result.updated,
      };
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "7",
      title: "Test 2 Edited 1",
      type: "Full Formula",
      description: "test",
      status: "Active",
      meta: "{test: 1}",
    },
  },
  savePriceListCategoryConfig: {
    operationType: "Mutation",
    httpMethod: "POST",
    type: "price-list-generator",
    fieldName: "savePriceListCategory",
    urlPath: "/pricelist/cat",
    params: {
      id: "id",
      title: "title",
      groupId: "listId",
    },
    response: {
      id: "id",
      title: "title",
      listId: "params.groupId",
      created: "created",
      updated: "updated",
    },
    response: (result, params) => {
      return {
        id: result.id,
        title: result.title,
        listId: params.listId,
        created: result.created,
        updated: result.updated,
      };
    },
    testHeaders: {
      "app-name": "staging",
      "app-api-key": "1552679244144731",
      "session-id": "sess_3370c378a71b03bf",
    },
    testArgs: {
      id: "10",
      title: "Item 1 Edited 2",
      listId: "7",
    },
  },
  deletePriceListConfig: {
    operationType: "Mutation",
    httpMethod: "DELETE",
    type: "price-list-generator",
    fieldName: "deletePriceList",
    urlPath: "/pricelist/type",
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
  deletePriceListCategoryConfig: {
    operationType: "Mutation",
    httpMethod: "DELETE",
    type: "price-list-generator",
    fieldName: "deletePriceListCategory",
    urlPath: "/pricelist/cat",
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
      id: "28",
    },
  },
  deletePriceListItemConfig: {
    operationType: "Mutation",
    httpMethod: "DELETE",
    type: "price-list-generator",
    fieldName: "deletePriceListItem",
    urlPath: "/pricelist/item",
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
      id: "30",
    },
  },
};

export const lambdaConfig = config.deletePriceListItemConfig;

export const allFieldNames = map(Object.values(config), "fieldName");
