module.exports = require('./lib/environment');
module.exports.setup = require('./lib/setup');
module.exports.getDynamodbClient = require('./lib/clients').getDynamodbClient;
module.exports.getDynamodbDocumentClient =
  require('./lib/clients').getDynamodbDocumentClient;
module.exports.destroyDynamodbClient =
  require('./lib/clients').destroyDynamodbClient;
module.exports.destroyDynanodbDocumentClient =
  require('./lib/clients').destroyDynanodbDocumentClient;
module.exports.getConnectionParams =
  require('./lib/clients').getConnectionParams;
module.exports.createTable = require('./lib/table-helpers').createTable;
module.exports.deleteTable = require('./lib/table-helpers').deleteTable;
