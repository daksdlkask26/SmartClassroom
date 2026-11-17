const { setTimeout } = require('node:timers/promises');
const { Timestamp, FieldValue } = require('firebase-admin/firestore');
const { readingId } = require('./normalize-reading.cjs');

const RETRYABLE_CODES = new Set([4, 8, 10, 13, 14]);

function createReadingStore(db, { sleep = setTimeout } = {}) {
  return {
    async saveReading(reading, { receivedAt = new Date(), retained = false } = {}) {
      const ref = db.collection('devices').doc(reading.deviceId)
        .collection('readings').doc(readingId(reading));
      const data = {
        ...reading,
        receivedAt: Timestamp.fromDate(receivedAt),
        storedAt: FieldValue.serverTimestamp(),
        retained: Boolean(retained)
      };
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await ref.create(data);
          return { id: ref.id, duplicate: false };
        } catch (error) {
          if (error.code === 6) return { id: ref.id, duplicate: true };
          if (!RETRYABLE_CODES.has(error.code) || attempt === 2) throw error;
          await sleep(500 * (2 ** attempt));
        }
      }
    }
  };
}

module.exports = { createReadingStore };
