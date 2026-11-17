// This double exercises retry/control flow. Real Firestore behavior is tested
// separately with the Emulator and the installed Admin SDK.
function createMemoryFirestore() {
  const documents = new Map();
  const state = { attempts: 0, failures: [], delays: [], timeoutAfterCommit: false };
  const db = {
    collection(collection) {
      return {
        doc(deviceId) {
          return {
            collection(subcollection) {
              return {
                doc(id) {
                  const path = [collection, deviceId, subcollection, id].join('/');
                  return {
                    id, path,
                    async create(data) {
                      state.attempts++;
                      if (state.failures.length) {
                        throw Object.assign(new Error('simulated write failure'), {
                          code: state.failures.shift()
                        });
                      }
                      if (documents.has(path)) {
                        throw Object.assign(new Error('already exists'), { code: 6 });
                      }
                      documents.set(path, data);
                      if (state.timeoutAfterCommit) {
                        state.timeoutAfterCommit = false;
                        throw Object.assign(new Error('response lost after commit'), { code: 4 });
                      }
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  };
  return { db, documents, state, sleep: async ms => { state.delays.push(ms); } };
}

module.exports = { createMemoryFirestore };
