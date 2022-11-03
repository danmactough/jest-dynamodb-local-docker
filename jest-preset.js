const path = require('path');
module.exports = {
  globalSetup: path.join(__dirname, 'lib', 'setup.js'),
  testEnvironment: path.join(__dirname, 'lib', 'environment.js'),
};
