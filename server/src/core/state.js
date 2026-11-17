// Trạng thái hiện tại của hệ thống: bản tin mới nhất, thiết bị, LED.
// Chỉ module này được sửa trạng thái; plugin đọc qua getter và nghe sự kiện trên bus.

const DEVICE_META = ['fw', 'intervalS', 'ssid', 'rssi', 'ledMode'];

export function createState({ bus, now = () => new Date() }) {
  let latest = null;
  let device = {
    online: false,
    reason: 'unknown',
    lastSeenAt: null,
    fw: null,
    intervalS: null,
    ssid: null,
    rssi: null,
    ledMode: null,
  };
  let led = { mode: null, palette: null, test: null, sentAt: null };

  function setDevice(patch) {
    const next = { ...device, ...patch };
    const changed = Object.keys(next).some((k) => next[k] !== device[k]);
    device = next;
    if (changed) bus.emit('device', structuredClone(device));
  }

  return {
    latest: () => (latest ? structuredClone(latest) : null),
    device: () => structuredClone(device),
    led: () => structuredClone(led),
    snapshot: () => ({ latest: latest ? structuredClone(latest) : null, device: structuredClone(device), led: structuredClone(led) }),

    /** Bản tin telemetry đã kiểm tra (validate.parseTelemetry). */
    applyReading(reading) {
      latest = reading;
      // Có bản tin = thiết bị đang trực tuyến. lastSeenAt đổi mỗi bản tin nên không phát 'device' vì nó;
      // chỉ phát khi online/reason đổi.
      const wasOnline = device.online;
      device = { ...device, lastSeenAt: reading.receivedAt };
      if (!wasOnline) setDevice({ online: true, reason: 'telemetry' });
      bus.emit('reading', structuredClone(reading));
    },

    /** Bản tin status đã kiểm tra (validate.parseStatus), kể cả LWT. */
    applyStatus(status) {
      const patch = { online: status.online, reason: status.online ? 'status' : 'lwt' };
      for (const k of DEVICE_META) if (k in status) patch[k] = status[k];
      if (status.online) patch.lastSeenAt = now().toISOString();
      setDevice(patch);
    },

    /** Thiết bị quá lâu không gửi bản tin (G3: device-watch). */
    markTimeout() {
      if (device.online) setDevice({ online: false, reason: 'timeout' });
    },

    /** Đã publish lệnh LED (G8). */
    applyLedSent(patch) {
      led = { ...led, ...patch };
      bus.emit('led:sent', structuredClone(led));
    },
  };
}
