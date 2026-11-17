// Coi thiết bị là ngoại tuyến khi quá contract.timing.offlineAfterS không có bản tin.
// LWT báo ngay khi rớt mạng đột ngột; module này lo trường hợp còn lại (treo, mất điện mà broker chưa phát hiện…).

export function createDeviceWatch({ state, config, now = () => Date.now(), intervalMs = 5000 }) {
  const limitMs = config.contract.timing.offlineAfterS * 1000;
  let timer = null;

  function check() {
    const d = state.device();
    if (!d.online || !d.lastSeenAt) return false;
    if (now() - Date.parse(d.lastSeenAt) > limitMs) {
      state.markTimeout();
      return true;
    }
    return false;
  }

  return {
    check,
    start() {
      if (!timer) timer = setInterval(check, intervalMs).unref();
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}
