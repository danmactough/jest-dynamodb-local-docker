'use strict';
const expect = require('expect');
const debug = require('debug')('jest-dynamodb-local-docker');
const {
  waitUntilTableExists,
  BillingMode,
} = require('@aws-sdk/client-dynamodb');
const { getDynamodbClient } = require('./clients');

// Logging out the error will help a user diagnose any setup issues more quickly,
// and from experience, a user won't do it, so we'll handle the error,
// log it, and then rethrow it.
const errHandler = (err) => {
  console.error(err);
  throw err;
};

/**
 * @param {object} params
 * @param {import('@aws-sdk/client-dynamodb').CreateTableInput} params.tableProperties
 * @returns {Promise<void>}
 */
async function createTable({ tableProperties }) {
  const ddb = getDynamodbClient();
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
  const ddb = getDynamodbClient();
  await ddb.deleteTable({ TableName }).catch(errHandler);
}

module.exports = {
  createTable,
  deleteTable,
};
