// Kết nối WebSocket /ws (contract mục 5): chỉ nhận, không gửi lệnh.
// Đứt thì tự nối lại theo lũy tiến 5 → 10 → 20 → 30 giây (HANDOFF §3.4); có nút "Thử lại" để nối ngay.

export const RETRY_DELAYS_S = [5, 10, 20, 30];

/**
 * @param {object} opts
 * @param {string} opts.url
 * @param {(msg: {type: string, at: string, data: any}) => void} opts.onMessage
 * @param {(conn: {ws: 'connecting'|'open'|'closed', retryAt: number|null}) => void} opts.onConn
 *        retryAt: giờ máy (ms) của lần thử lại kế tiếp; null khi đang thử
 */
export function connectWs({ url, onMessage, onConn, delaysS = RETRY_DELAYS_S }) {
  let socket = null;
  let failures = 0;
  let everOpened = false;
  let timer = null;
  let stopped = false;

  function open() {
    clearTimeout(timer);
    timer = null;
    if (stopped) return;
    // Lần đầu: "đang kết nối". Các lần thử lại: vẫn là "mất kết nối", chỉ bỏ đếm ngược.
    onConn({ ws: everOpened || failures ? 'closed' : 'connecting', retryAt: null });

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleRetry();
      return;
    }
    socket = ws;

    ws.addEventListener('open', () => {
      if (socket !== ws) return;
      everOpened = true;
      failures = 0;
      onConn({ ws: 'open', retryAt: null });
    });

    ws.addEventListener('message', (ev) => {
      if (socket !== ws) return;
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return; // máy chủ không gửi JSON hỏng; nếu có thì bỏ qua
      }
      if (msg && typeof msg.type === 'string') onMessage(msg);
    });

    ws.addEventListener('close', () => {
      if (socket !== ws) return;
      socket = null;
      if (!stopped) scheduleRetry();
    });
    // 'error' luôn đi kèm 'close' nên không cần xử lý riêng.
  }

  function scheduleRetry() {
    failures += 1;
    const delayS = delaysS[Math.min(failures - 1, delaysS.length - 1)];
    const retryAt = Date.now() + delayS * 1000;
    onConn({ ws: 'closed', retryAt });
    timer = setTimeout(open, delayS * 1000);
  }

  /** Nút "Thử lại", hoặc trình duyệt báo có mạng lại. */
  function reconnectNow() {
    if (stopped || socket) return;
    open();
  }

  const onOnline = () => reconnectNow();
  window.addEventListener('online', onOnline);

  open();

  return {
    reconnectNow,
    close() {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('online', onOnline);
      socket?.close();
      socket = null;
    },
  };
}

/** ws://host/ws hoặc wss://host/ws theo trang hiện tại. */
export function wsUrl(loc = window.location) {
  return `${loc.protocol === 'https:' ? 'wss' : 'ws'}://${loc.host}/ws`;
}
