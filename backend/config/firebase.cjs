const { randomUUID } = require('node:crypto');
const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function createFirestore(config) {
  const options = { projectId: config.projectId };
  // Use the resolved path, rather than ADC resolving the original env value
  // against whichever directory launched this process.
  if (!config.emulatorHost) options.credential = cert(config.credentialsPath);
  const app = initializeApp(options, 'sensor-logging-' + randomUUID());
  const db = getFirestore(app);
  if (config.emulatorHost) db.settings({ host: config.emulatorHost, ssl: false });

  return {
    db,
    async close() {
      try {
        await db.terminate();
      } finally {
        await deleteApp(app);
      }
    }
  };
}

module.exports = { createFirestore };
