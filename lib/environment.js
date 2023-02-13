// @ts-check
'use strict';
const NodeEnvironment = require('jest-environment-node');
const expect = require('expect');
const debug = require('debug')('jest-dynamodb-local-docker');
const DynamoDB = require('aws-sdk/clients/dynamodb');

function getConnectionParams() {
  return {
    accesKeyId: 'test',
    secretAccessKey: 'test',
    endpoint: `http://localhost:${process.env.__JEST_DYNAMODB_LOCAL_DOCKER__PORT}`,
    httpOptions: {
      connectTimeout: 2000,
    },
    region: 'local',
  };
}

class DynamodbLocalDockerEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    this.ddbClient = new DynamoDB(getConnectionParams());
    this.ddbDocumentClient = new DynamoDB.DocumentClient(getConnectionParams());
  }

  async setup() {
    debug('Setting up test environment');
    await super.setup();
    /** @returns {import('aws-sdk').DynamoDB} */
    this.global.getDynamodbClient = () => this.ddbClient;
    /** @returns {import('aws-sdk').DynamoDB.DocumentClient} */
    this.global.getDynamodbDocumentClient = () => this.ddbDocumentClient;
    this.global.createTable = createTable;
    this.global.deleteTable = deleteTable;
  }

  /** @type {<T = unknown>(script: import('vm').Script) => T} */
  runScript(script) {
    return super.runScript(script);
  }
}

/**
 * @param {object} params
 * @param {import('aws-sdk').DynamoDB.CreateTableInput} params.tableProperties
 * @returns {Promise<void>}
 */
async function createTable({ tableProperties }) {
  const ddb = new DynamoDB(getConnectionParams());
  const { TableName } = tableProperties;
  try {
    const { Table: table } = await ddb.describeTable({ TableName }).promise();
    if (table.TableStatus !== 'ACTIVE') {
      throw new Error(
        `Table ${TableName} status is ${
          table.TableStatus || 'not ACTIVE'
        }. unable to proceed`
      );
    }
    // @ts-ignore
    expect(table).toMatchObject(tableProperties);
  } catch (e) {
    // Table does not exist. Create it.
    if (e.code === 'ResourceNotFoundException') {
      const params = {
        ...tableProperties,
        TableName,
        BillingMode: 'PAY_PER_REQUEST',
      };
      await ddb.createTable(params).promise();
      await ddb.waitFor('tableExists', { TableName }).promise();
      debug(`Table ${TableName} is ready`);
    } else {
      throw e;
    }
  }
}

/**
 * @param {object} params
 * @param {string} params.tableName
 * @returns {Promise<void>}
 */
async function deleteTable({ tableName: TableName }) {
  const ddb = new DynamoDB(getConnectionParams());
  await ddb.deleteTable({ TableName }).promise();
}

module.exports = DynamodbLocalDockerEnvironment;
