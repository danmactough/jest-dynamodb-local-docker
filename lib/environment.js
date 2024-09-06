// @ts-check
'use strict';
const util = require('node:util');
const { default: NodeEnvironment } = require('jest-environment-node');
const debug = require('debug')('jest-dynamodb-local-docker');
const {
  getDynamodbClient,
  getDynamodbDocumentClient,
  destroyDynamodbClient,
  destroyDynanodbDocumentClient,
} = require('./clients');
const { createTable, deleteTable } = require('./table-helpers');

class DynamodbLocalDockerEnvironment extends NodeEnvironment {
  async setup() {
    debug('Setting up test environment');
    await super.setup();
    this.global.getDynamodbClient = util.deprecate(
      getDynamodbClient,
      `global.getDynamodbClient is deprecated and will be removed in the next major version release. Use const { getDynamodbClient } = require('jest-dynamodb-local-docker') instead.`
    );
    this.global.getDynamodbDocumentClient = util.deprecate(
      getDynamodbDocumentClient,
      `global.getDynamodbDocumentClient is deprecated and will be removed in the next major version release. Use const { getDynamodbDocumentClient } = require('jest-dynamodb-local-docker') instead.`
    );
    this.global.createTable = util.deprecate(
      createTable,
      `global.createTable is deprecated and will be removed in the next major version release. Use const { createTable } = require('jest-dynamodb-local-docker') instead.`
    );
    this.global.deleteTable = util.deprecate(
      deleteTable,
      `global.deleteTable is deprecated and will be removed in the next major version release. Use const { deleteTable } = require('jest-dynamodb-local-docker') instead.`
    );
  }

  async teardown() {
    debug('Tearing down test environment');
    destroyDynamodbClient();
    destroyDynanodbDocumentClient();
    await super.teardown();
  }
}

module.exports = DynamodbLocalDockerEnvironment;
