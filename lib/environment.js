// @ts-check
'use strict';
const { default: NodeEnvironment } = require('jest-environment-node');
const expect = require('expect');
const debug = require('debug')('jest-dynamodb-local-docker');
const {
  DynamoDB,
  DynamoDBClient,
  waitUntilTableExists,
  BillingMode,
} = require('@aws-sdk/client-dynamodb');
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
// Logging out the error will help a user diagnose any setup issues more quickly,
// and from experience, a user won't do it, so we'll handle the error,
// log it, and then rethrow it.
const errHandler = (err) => {
  console.error(err);
  throw err;
};

function getConnectionParams() {
  return {
    accesKeyId: 'test',
    secretAccessKey: 'test',
    endpoint: `http://localhost:${process.env.__JEST_DYNAMODB_LOCAL_DOCKER__PORT}`,
    requestHandler: new NodeHttpHandler({
      httpAgent: new HttpAgent(),
      connectionTimeout: 2000,
    }),
    logger,
    region: 'local',
  };
}

class DynamodbLocalDockerEnvironment extends NodeEnvironment {
  constructor(config, _context) {
    super(config, _context);
    this.ddbClient = new DynamoDB(getConnectionParams());
    this.ddbDocumentClient = DynamoDBDocument.from(
      new DynamoDBClient(getConnectionParams())
    );
  }

  async setup() {
    debug('Setting up test environment');
    await super.setup();
    /** @returns {import('@aws-sdk/client-dynamodb').DynamoDB} */
    this.global.getDynamodbClient = () => this.ddbClient;
    /** @returns {import('@aws-sdk/lib-dynamodb').DynamoDBDocument} */
    this.global.getDynamodbDocumentClient = () => this.ddbDocumentClient;
    this.global.createTable = createTable;
    this.global.deleteTable = deleteTable;
  }
}

/**
 * @param {object} params
 * @param {import('@aws-sdk/client-dynamodb').CreateTableInput} params.tableProperties
 * @returns {Promise<void>}
 */
async function createTable({ tableProperties }) {
  const ddb = new DynamoDB(getConnectionParams());
  const { TableName } = tableProperties;
  try {
    // We won't use our errHandler on describeTable because we expect to see
    // lots of `ResourceNotFoundException` errors that are not _actually_ errors.
    const { Table: table } = await ddb.describeTable({ TableName });
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
    if (e.name === 'ResourceNotFoundException') {
      const params = {
        ...tableProperties,
        TableName,
        BillingMode: BillingMode.PAY_PER_REQUEST,
      };
      await ddb.createTable(params).catch(errHandler);
      await waitUntilTableExists(
        { client: ddb, maxWaitTime: 60 },
        { TableName }
      ).catch(errHandler);
      debug(`Table ${TableName} is ready`);
    } else {
      // Because we aren't using our errHandler on describeTable, we will
      // manually log the error before rethrowing it.
      console.error(e);
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
  await ddb.deleteTable({ TableName }).catch(errHandler);
}

module.exports = DynamodbLocalDockerEnvironment;
