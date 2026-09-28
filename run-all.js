const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Starting SupportMemory AI (Backend + Frontend)...');

function startProcess(name, args, cwd) {
  const proc = spawn(npmCmd, args, {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  proc.on('close', (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });

  return proc;
}

const backend = startProcess('backend', ['run', 'dev'], path.join(__dirname, 'backend'));
const frontend = startProcess('frontend', ['run', 'dev'], path.join(__dirname, 'frontend'));

function cleanup() {
  console.log('\nStopping servers...');
  if (isWin) {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid.toString(), '/T', '/F']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid.toString(), '/T', '/F']);
  } else {
    backend.kill();
    frontend.kill();
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

