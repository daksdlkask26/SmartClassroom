const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { mkdtempSync, writeFileSync } = require('node:fs');
const { removeTestTemp } = require('./helpers/remove-temp.cjs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { createFirestore } = require('../config/firebase.cjs');

test('Firestore uses the resolved key path independently of ADC and the working directory', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'smartclassroom cert-'));
  t.after(() => removeTestTemp(dir));
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' }
  });
  const credentialsPath = join(dir, 'key.json');
  writeFileSync(credentialsPath, JSON.stringify({
    project_id: 'smartclassroom-test', client_email: 'test@smartclassroom-test.iam.gserviceaccount.com',
    private_key: privateKey
  }), { mode: 0o600 });
  const oldPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = join(dir, 'missing-adc-file.json');
  t.after(() => {
    if (oldPath === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = oldPath;
  });
  const firebase = createFirestore({ projectId: 'smartclassroom-test', emulatorHost: null, credentialsPath });
  try {
    // Reading settings and closing the client do not contact a cloud service.
    assert.equal(firebase.db.projectId, 'smartclassroom-test');
  } finally {
    await firebase.close();
  }
});
