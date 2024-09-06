'use strict';
const debug = require('debug')('jest-dynamodb-local-docker');
const { DynamoDB, DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const { Agent: HttpAgent } = require('http');

const logger = {
  debug,
  log: debug,
  info: debug,
  warn: debug,
  error: debug,
};

function getConnectionParams({ connectionTimeout = 2000 } = {}) {
  return {
    accessKeyId: 'test',
    secretAccessKey: 'test',
    endpoint: `http://localhost:${process.env.__JEST_DYNAMODB_LOCAL_DOCKER__PORT}`,
    requestHandler: new NodeHttpHandler({
      httpAgent: new HttpAgent(),
      connectionTimeout,
    }),
    logger,
    region: 'local',
  };
}

let ddbClient;
let ddbDocumentClient;

module.exports = {
  /** @returns {import('@aws-sdk/client-dynamodb').DynamoDB} */
  getDynamodbClient() {
    return ddbClient ?? (ddbClient = new DynamoDB(getConnectionParams()));
  },
  destroyDynamodbClient() {
    if (ddbClient) {
      ddbClient.destroy();
    }
    ddbClient = undefined;
  },
  /** @returns {import('@aws-sdk/lib-dynamodb').DynamoDBDocument} */
  getDynamodbDocumentClient() {
    return (
      ddbDocumentClient ??
      (ddbDocumentClient = DynamoDBDocument.from(
        new DynamoDBClient(getConnectionParams())
      ))
    );
  },
  destroyDynanodbDocumentClient() {
    if (ddbDocumentClient) {
      ddbDocumentClient.destroy();
    }
    ddbDocumentClient = undefined;
  },
  getConnectionParams,
};
