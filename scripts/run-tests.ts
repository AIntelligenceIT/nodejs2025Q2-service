import { spawn } from 'child_process';
import * as http from 'http';

const PORT = process.env.PORT || '4000';
const HOST = `http://localhost:${PORT}`;
const START_TIMEOUT = 30000;

function waitForServer(url: string, timeout = START_TIMEOUT): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      http
        .get(url, (res) => {
          resolve();
        })
        .on('error', (err) => {
          if (Date.now() - start > timeout) {
            reject(new Error('Timeout waiting for server'));
          } else {
            setTimeout(check, 200);
          }
        });
    })();
  });
}

async function main() {
  console.log('Starting server...');
  const serverProc = spawn('node', ['-r', 'ts-node/register', 'scripts/start-server.ts'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, TEST_MODE: process.env.TEST_MODE || 'auth' },
  });

  try {
    await waitForServer(HOST);
    console.log('Server is up, running tests...');

    const jestArgs = ['--testPathIgnorePatterns', 'refresh.e2e.spec.ts', '--noStackTrace', '--runInBand'];
    const jestProc = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      env: { ...process.env, TEST_MODE: process.env.TEST_MODE || 'auth' },
    });

    const exitCode: number = await new Promise((resolve) => {
      jestProc.on('close', (code) => resolve(typeof code === 'number' ? code : 1));
    });

    console.log('Tests finished with code', exitCode);
    serverProc.kill();
    process.exit(exitCode);
  } catch (err) {
    console.error('Error during run-tests:', err);
    serverProc.kill();
    process.exit(1);
  }
}

main();
