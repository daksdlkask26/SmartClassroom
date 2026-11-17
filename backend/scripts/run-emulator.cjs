const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

const mode = process.argv[2];
if (!['start', 'test'].includes(mode)) {
  console.error('Dùng npm run emulators hoặc npm run test:integration.');
  process.exitCode = 1;
} else {
  const env = { ...process.env };
  // Firebase CLI debug mode can print its child environment. Emulator tests
  // need neither cloud credentials nor MQTT credentials from the user's shell.
  for (const key of Object.keys(env)) {
    if (key === 'DEBUG' || key === 'GOOGLE_APPLICATION_CREDENTIALS'
      || key === 'FIREBASE_TOKEN' || key === 'FIREBASE_CONFIG'
      || key === 'FIRESTORE_EMULATOR_HOST' || key === 'FIREBASE_EMULATOR_HUB'
      || key.startsWith('MQTT_')) delete env[key];
  }
  const backend = resolve(__dirname, '..');
  const cli = resolve(backend, 'node_modules/firebase-tools/lib/bin/firebase.js');
  const args = [cli, mode === 'test' ? 'emulators:exec' : 'emulators:start',
    '--config', resolve(backend, 'config/firebase.json'),
    '--only', 'firestore', '--project', 'demo-smartclassroom'];
  if (mode === 'test') args.push('node --test test/integration/*.test.cjs');
  const child = spawn(process.execPath, args, {
    cwd: backend, env, stdio: 'inherit', windowsHide: true
  });
  child.on('error', error => {
    console.error('[emulator-start-failed]', error.message);
    process.exitCode = 1;
  });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
