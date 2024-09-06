const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const {
  getDynamodbClient,
  getDynamodbDocumentClient,
  createTable,
  deleteTable,
} = require('..');

describe('basic', () => {
  it('should define our globals', () => {
    expect(global.getDynamodbClient).toEqual(expect.any(Function));
    expect(global.getDynamodbDocumentClient).toEqual(expect.any(Function));
    expect(global.createTable).toEqual(expect.any(Function));
    expect(global.deleteTable).toEqual(expect.any(Function));
  });
  it('should deprecate our globals', () => {
    expect(global.getDynamodbClient.name).toEqual('deprecated');
    expect(global.getDynamodbDocumentClient.name).toEqual('deprecated');
    expect(global.createTable.name).toEqual('deprecated');
    expect(global.deleteTable.name).toEqual('deprecated');
  });
});
describe('globals', () => {
  describe('getDynamodbClient', () => {
    it('should return a DynamoDB client', () => {
      const ddbClient = global.getDynamodbClient();
      expect(ddbClient.batchGetItem).toEqual(expect.any(Function));
      expect(ddbClient.batchWriteItem).toEqual(expect.any(Function));
      expect(ddbClient.deleteItem).toEqual(expect.any(Function));
      expect(ddbClient.getItem).toEqual(expect.any(Function));
      expect(ddbClient.putItem).toEqual(expect.any(Function));
      expect(ddbClient.query).toEqual(expect.any(Function));
      expect(ddbClient.scan).toEqual(expect.any(Function));
      expect(ddbClient.updateItem).toEqual(expect.any(Function));
      expect(ddbClient.transactGetItems).toEqual(expect.any(Function));
      expect(ddbClient.transactWriteItems).toEqual(expect.any(Function));
    });
  });
  describe('getDynamodbDocumentClient', () => {
    it('should return a DynamoDB.DocumentClient client', () => {
      const ddbClient = global.getDynamodbDocumentClient();
      expect(ddbClient.batchGet).toEqual(expect.any(Function));
      expect(ddbClient.batchWrite).toEqual(expect.any(Function));
      expect(ddbClient.delete).toEqual(expect.any(Function));
      expect(ddbClient.get).toEqual(expect.any(Function));
      expect(ddbClient.put).toEqual(expect.any(Function));
      expect(ddbClient.query).toEqual(expect.any(Function));
      expect(ddbClient.scan).toEqual(expect.any(Function));
      expect(ddbClient.update).toEqual(expect.any(Function));
      expect(ddbClient.transactGet).toEqual(expect.any(Function));
      expect(ddbClient.transactWrite).toEqual(expect.any(Function));
    });
  });
  describe('createTable', () => {
    const tableName = 'createTable_test';
    afterEach(async () => {
      await global.deleteTable({ tableName });
    });
    it('should create a table', async () => {
      const tableProperties = {
        TableName: tableName,
        AttributeDefinitions: [
          {
            AttributeName: 'partition',
            AttributeType: 'S',
          },
          {
            AttributeName: 'sort',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'partition',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'sort',
            KeyType: 'RANGE',
          },
        ],
      };
      const ddbClient = global.getDynamodbDocumentClient();
      await expect(
        global.createTable({ tableProperties })
      ).resolves.toBeUndefined();
      await expect(
        ddbClient.put({
          TableName: tableName,
          Item: { partition: 'abc', sort: '1' },
        })
      ).resolves.toEqual(expect.anything());
      await expect(
        ddbClient.get({
          TableName: tableName,
          Key: {
            partition: 'abc',
            sort: '1',
          },
        })
      ).resolves.toMatchInlineSnapshot(
        { $metadata: expect.any(Object) },
        `
      {
        "$metadata": Any<Object>,
        "Item": {
          "partition": "abc",
          "sort": "1",
        },
      }
    `
      );
    });
  });
  describe('deleteTable', () => {
    const tableName = 'createTable_test';
    beforeEach(async () => {
      const tableProperties = {
        TableName: tableName,
        AttributeDefinitions: [
          {
            AttributeName: 'partition',
            AttributeType: 'S',
          },
          {
            AttributeName: 'sort',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'partition',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'sort',
            KeyType: 'RANGE',
          },
        ],
      };
      await expect(
        global.createTable({ tableProperties })
      ).resolves.toBeUndefined();
    });
    it('should delete a table', async () => {
      await expect(global.deleteTable({ tableName })).resolves.toBeUndefined();
    });
  });
});
describe('getDynamodbClient', () => {
  it('should return a DynamoDB client', () => {
    const ddbClient = getDynamodbClient();
    expect(ddbClient.batchGetItem).toEqual(expect.any(Function));
    expect(ddbClient.batchWriteItem).toEqual(expect.any(Function));
    expect(ddbClient.deleteItem).toEqual(expect.any(Function));
    expect(ddbClient.getItem).toEqual(expect.any(Function));
    expect(ddbClient.putItem).toEqual(expect.any(Function));
    expect(ddbClient.query).toEqual(expect.any(Function));
    expect(ddbClient.scan).toEqual(expect.any(Function));
    expect(ddbClient.updateItem).toEqual(expect.any(Function));
    expect(ddbClient.transactGetItems).toEqual(expect.any(Function));
    expect(ddbClient.transactWriteItems).toEqual(expect.any(Function));
  });
});
describe('getDynamodbDocumentClient', () => {
  it('should return a DynamoDB.DocumentClient client', () => {
    const ddbClient = getDynamodbDocumentClient();
    expect(ddbClient.batchGet).toEqual(expect.any(Function));
    expect(ddbClient.batchWrite).toEqual(expect.any(Function));
    expect(ddbClient.delete).toEqual(expect.any(Function));
    expect(ddbClient.get).toEqual(expect.any(Function));
    expect(ddbClient.put).toEqual(expect.any(Function));
    expect(ddbClient.query).toEqual(expect.any(Function));
    expect(ddbClient.scan).toEqual(expect.any(Function));
    expect(ddbClient.update).toEqual(expect.any(Function));
    expect(ddbClient.transactGet).toEqual(expect.any(Function));
    expect(ddbClient.transactWrite).toEqual(expect.any(Function));
  });
});
describe('createTable', () => {
  const tableName = 'createTable_test';
  afterEach(async () => {
    await deleteTable({ tableName });
  });
  it('should create a table', async () => {
    const tableProperties = {
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'partition',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sort',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'partition',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sort',
          KeyType: 'RANGE',
        },
      ],
    };
    const ddbClient = getDynamodbDocumentClient();
    await expect(createTable({ tableProperties })).resolves.toBeUndefined();
    await expect(
      ddbClient.put({
        TableName: tableName,
        Item: { partition: 'abc', sort: '1' },
      })
    ).resolves.toEqual(expect.anything());
    await expect(
      ddbClient.get({
        TableName: tableName,
        Key: {
          partition: 'abc',
          sort: '1',
        },
      })
    ).resolves.toMatchInlineSnapshot(
      { $metadata: expect.any(Object) },
      `
      {
        "$metadata": Any<Object>,
        "Item": {
          "partition": "abc",
          "sort": "1",
        },
      }
    `
    );
  });
});
describe('deleteTable', () => {
  const tableName = 'createTable_test';
  beforeEach(async () => {
    const tableProperties = {
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'partition',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sort',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'partition',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sort',
          KeyType: 'RANGE',
        },
      ],
    };
    await expect(createTable({ tableProperties })).resolves.toBeUndefined();
  });
  it('should delete a table', async () => {
    await expect(deleteTable({ tableName })).resolves.toBeUndefined();
  });
});
describe('client identity', () => {
  describe('DynamoDB', () => {
    it('should pass instanceof test', () => {
      expect(global.getDynamodbClient()).not.toBeInstanceOf(DynamoDB);
      expect(getDynamodbClient()).toBeInstanceOf(DynamoDB);
    });
  });
  describe('DynamoDBDocument', () => {
    it('should pass instanceof test', () => {
      expect(global.getDynamodbDocumentClient()).not.toBeInstanceOf(
        DynamoDBDocument
      );
      expect(getDynamodbDocumentClient()).toBeInstanceOf(DynamoDBDocument);
    });
  });
});
