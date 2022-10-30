const path = require('path');
module.exports = {
  globalSetup: path.join(__dirname, 'lib', 'setup.js'),
  globalTeardown: path.join(__dirname, 'lib', 'teardown.js'),
  testEnvironment: path.join(__dirname, 'lib', 'environment.js'),
};
