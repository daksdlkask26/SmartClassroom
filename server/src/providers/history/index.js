// Chọn nguồn dữ liệu lịch sử theo HISTORY_PROVIDER (plan.md mục 6.5).
// Mỗi provider là một file cùng thư mục, xuất `create({ config, bus, log })` trả về `{ query, close }`.
//   memory    — bộ nhớ, dùng khi giả lập (có sẵn)
//   firestore — Tuấn thêm (ID 4, 5)

export async function loadHistoryProvider({ config, bus, log }) {
  const name = config.historyProvider;
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`HISTORY_PROVIDER="${name}" không hợp lệ`);
  let mod;
  try {
    mod = await import(`./${name}.js`);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' && err.message.includes(`${name}.js`)) {
      throw new Error(`HISTORY_PROVIDER=${name} nhưng chưa có file server/src/providers/history/${name}.js`);
    }
    throw err;
  }
  if (typeof mod.create !== 'function') throw new Error(`providers/history/${name}.js phải xuất hàm create()`);
  const provider = await mod.create({ config, bus, log: log.child(`history:${name}`) });
  if (typeof provider?.query !== 'function') throw new Error(`Provider "${name}" phải có hàm query()`);
  return { name, ...provider, close: provider.close ?? (async () => {}) };
}
