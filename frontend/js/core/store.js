// Trạng thái duy nhất của giao diện (plan.md 8.3).
// Component đăng ký theo selector và chỉ chạy lại khi phần mình cần thay đổi (so sánh ===).

/**
 * @typedef {object} AppState
 * @property {object|null} config     contract/system.json
 * @property {'sim'|'live'|null} mode
 * @property {object|null} latest     Reading mới nhất (contract mục 5.4)
 * @property {object|null} device     DeviceState
 * @property {object|null} led        LedState
 * @property {object|null} session    { authEnabled, user }
 * @property {{ ws: 'connecting'|'open'|'closed', retryAt: number|null }} conn
 * @property {number} beat            tăng 1 mỗi bản tin reading (chấm nhịp)
 */

export function createStore(initial) {
  let state = initial;
  const subs = new Set();

  return {
    get: () => state,

    /** set({ a }) hoặc set(s => ({ a: f(s) })) — gộp nông vào trạng thái hiện tại. */
    set(patch) {
      const prev = state;
      const next = typeof patch === 'function' ? patch(prev) : patch;
      state = { ...prev, ...next };
      for (const sub of [...subs]) sub(state, prev);
    },

    /**
     * subscribe(s => s.latest, (latest, state) => …). Gọi ngay một lần khi đăng ký.
     * @returns {() => void} hủy đăng ký
     */
    subscribe(selector, fn, { immediate = true } = {}) {
      const sub = (s, prev) => {
        const v = selector(s);
        if (v !== selector(prev)) fn(v, s);
      };
      subs.add(sub);
      if (immediate) fn(selector(state), state);
      return () => subs.delete(sub);
    },
  };
}

export const initialState = Object.freeze({
  config: null,
  mode: null,
  latest: null,
  device: null,
  led: null,
  session: null,
  conn: { ws: 'connecting', retryAt: null },
  beat: 0,
});
