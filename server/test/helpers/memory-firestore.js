// Firestore giả trong bộ nhớ, đủ cho kiểm thử logic ghi/thử lại/giao dịch.
// Hành vi thật của Firestore được kiểm riêng bằng Emulator (test/integration/).
import { Timestamp } from 'firebase-admin/firestore';

export function createMemoryFirestore() {
  const documents = new Map(); // đường dẫn → dữ liệu
  const state = { attempts: 0, failures: [], delays: [], timeoutAfterCommit: false };

  const doc = (path) => ({
    id: path.split('/').pop(),
    path,
    collection: (name) => collection(`${path}/${name}`),
  });

  function collection(path) {
    return {
      doc: (id) => doc(`${path}/${id}`),
      where(field, op, value) { return query(path, [[field, op, value]]); },
    };
  }

  const rawGet = (path) => documents.get(path);
  const snapshotOf = (ref) => {
    const data = rawGet(ref.path);
    return { exists: data !== undefined, id: ref.id, ref, data: () => data };
  };

  function query(path, filters, order) {
    return {
      where: (field, op, value) => query(path, [...filters, [field, op, value]], order),
      orderBy: (field) => query(path, filters, field),
      async get() {
        const prefix = `${path}/`;
        const docs = [...documents.entries()]
          .filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/'))
          .filter(([, data]) => filters.every(([field, op, value]) => {
            const x = data[field]?.toMillis?.() ?? data[field];
            const y = value?.toMillis?.() ?? value;
            return op === '>=' ? x >= y : op === '<' ? x < y : op === '<=' ? x <= y : op === '>' ? x > y : x === y;
          }))
          .sort(([, a], [, b]) => {
            const f = order ?? 'receivedAt';
            return (a[f]?.toMillis?.() ?? a[f]) - (b[f]?.toMillis?.() ?? b[f]);
          })
          .map(([p, data]) => ({ id: p.split('/').pop(), data: () => data }));
        return { docs, size: docs.length };
      },
    };
  }

  const db = {
    collection,
    // Giao dịch: ghi dồn lại, chỉ áp dụng khi hàm xử lý xong và không có lệnh nào lỗi (như Firestore thật).
    async runTransaction(fn) {
      state.attempts++;
      if (state.failures.length) {
        throw Object.assign(new Error('simulated write failure'), { code: state.failures.shift() });
      }
      const writes = [];
      const tx = {
        get: async (ref) => snapshotOf(ref),
        create(ref, data) { writes.push(['create', ref, data]); return tx; },
        set(ref, data) { writes.push(['set', ref, data]); return tx; },
      };
      await fn(tx);
      const staged = new Map();
      for (const [kind, ref, data] of writes) {
        if (kind === 'create' && (documents.has(ref.path) || staged.has(ref.path))) {
          throw Object.assign(new Error('already exists'), { code: 6 });
        }
        staged.set(ref.path, data);
      }
      for (const [p, data] of staged) documents.set(p, data);
      if (state.timeoutAfterCommit) {
        state.timeoutAfterCommit = false;
        throw Object.assign(new Error('response lost after commit'), { code: 4 });
      }
    },
  };
  return { db, documents, state, sleep: async (ms) => { state.delays.push(ms); }, Timestamp };
}
