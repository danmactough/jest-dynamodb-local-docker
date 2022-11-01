// @ts-check
'use strict';
const exec = require('util').promisify(require('child_process').exec);
const debug = require('debug')('jest-dynamodb-local-docker');
const onExit = require('signal-exit');

let didAlreadyRunInWatchMode;

async function setup(jestConfig = {}) {
  // If we are in watch mode, - only launchDynamoDbLocalDocker() once.
  if (jestConfig.watch || jestConfig.watchAll) {
    if (didAlreadyRunInWatchMode) return;
    didAlreadyRunInWatchMode = true;
  }

  try {
    await launchDynamoDbLocalDocker();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function launchDynamoDbLocalDocker() {
  if ('__JEST_DYNAMODB_LOCAL_DOCKER__PORT' in process.env) {
    debug(
      `process.env.__JEST_DYNAMODB_LOCAL_DOCKER__PORT already set: ${process.env.__JEST_DYNAMODB_LOCAL_DOCKER__PORT}`
    );
    return;
  }
  let ddbLocalContainerId, ddbLocalPort;
  {
    const { stdout } = await exec(
      'docker run -d -p 8000 --rm amazon/dynamodb-local'
    );
    ddbLocalContainerId = stdout
      .toString()
      .split('\n')
      .filter((line) => line.length)
      .pop();
  }
  {
    const { stdout } = await exec(
      `docker ps -q --filter id=${ddbLocalContainerId} --format '{{.Ports}}'`
    );
    ddbLocalPort = stdout.toString().split('->')[0].split(':')[1];
  }
  await waitFor({ port: ddbLocalPort, retryTimeout: 50 });
  global[Symbol.for('ddbLocalContainerId')] = ddbLocalContainerId;
  process.env.__JEST_DYNAMODB_LOCAL_DOCKER__PORT = ddbLocalPort; // expose the port on process.env for helper functions to use because i guess jest provides that to each worker, but the symbol table is unique?
  debug(
    `DynamoDB running on port ${ddbLocalPort} as container id ${ddbLocalContainerId.slice(
      0,
      12
    )}`
  );
}

let watchModeKillCommandScheduled = false;

// This teardown function runs after every complete test-run
// In watch mode, this will fire each time a change is detected and tests re-run
async function teardownDynamoDbLocalDocker(jestConfig = {}) {
  const containerId = global[Symbol.for('ddbLocalContainerId')];
  if (containerId) {
    const killContainer = async () => {
      await exec(`docker kill ${containerId}`);
    };
    if (jestConfig.watch || jestConfig.watchAll) {
      if (!watchModeKillCommandScheduled) {
        onExit(killContainer); // In watch mode, set the kill command to run on process exit
        watchModeKillCommandScheduled = true; // And then make sure we don't try setting it up again
      }
    } else {
      await killContainer(); // // If we're not in watch mode, then testing is complete; kill docker container now
    }
  }
}

function waitFor({
  port = undefined,
  host = undefined,
  retryTimeout = 250,
  timeout = Infinity,
} = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    debug(`Waiting for port ${port} with timeout ${timeout}`);
    const timer = setInterval(() => {
      const socket = new (require('net').Socket)();
      socket
        .connect(port, host)
        .once('error', (err) => {
          const now = Date.now();
          if (now - start >= timeout) {
            clearInterval(timer);
            socket.destroy();
            debug(`Timeout waiting for ${host}:${port}`);
            reject(err);
          } else {
            debug('Waiting...');
          }
        })
        .once('connect', () => {
          clearInterval(timer);
          socket.destroy();
          debug('Ready');
          resolve();
        });
    }, retryTimeout);
  });
}

module.exports = {
  setup,
  teardownDynamoDbLocalDocker,
};
