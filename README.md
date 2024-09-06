# jest-dynamodb-local-docker

Jest preset and helper functions for easily running tests using DynamoDB local

## Usage

See the [tests in this repo](./test/basic.test.js) for example usage.

```js
const {
  getDynamodbClient,
  getDynamodbDocumentClient,
  createTable,
  deleteTable,
} = require('jest-dynamodb-local-docker');

describe('test', () => {
  beforeAll(async () => {
    await createTable(/* table properties */);
  });
  afterAll(async () => {
    await deleteTable(/* { tableName: 'table name' } */);
  });
  it('should work', async () => {
    const ddb = getDynamodbDocumentClient(); // or use the standard DynamoDB Client with getDynamodbClient()
    await ddb.put(/* put request */);
    await expect(
      ddb.get(/* get request */)
    ).toStrictEqual(/* the item we just wrote */);
  });
});
```

### Add to your Jest setup

Add the `jest-dynamodb-local-docker` [preset to your Jest config](https://jestjs.io/docs/configuration#preset-string). For example:

```json
// in your package.json
{
  "jest": {
    "preset": "jest-dynamodb-local-docker"
  }
}
```

### Globals (Deprecated)

- **`global.createTable`** - Creates a DynamoDB table
- **`global.deleteTable`** - Deletes a DynamoDB table
- **`global.getDynamodbClient`** and **`global.getDynamodbDocumentClient`** - Get a standard DynamoDB Client or DynamoDB DocumentClient configured to use DynamoDB local

### `jest --runInBand`

You may need to use the [`--runInBand` configuration flag](https://jestjs.io/docs/cli#--runinband) when running your Jest tests. Otherwise, you can have multiple test workers trying to create/delete the same tables concurrently, which will probably lead to unexpected results.

Alternatively, if you ensure that each test uses a unique table, you should be able to run without `--runInBand`.

### Debugging

We use [debug](https://github.com/debug-js/debug) for debugging logs. To turn on the debugging logs, run your tests like:

```sh
DEBUG="jest-dynamodb-local-docker" jest --runInBand
```
