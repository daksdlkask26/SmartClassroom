import { Router } from 'express';
import { parsePaletteBody, parseTestBody } from '../../core/led-cmd.js';
import { sendError } from '../errors.js';

const PUBLISH_TIMEOUT_MS = 5000;

/**
 * POST /api/led/palette  { palette }                         → 202 { sentAt }
 * POST /api/led/test     { mode:"test", on, color } | { mode:"auto" } → 202 { sentAt }
 *
 * 202 nghĩa là ĐÃ GỬI lệnh lên broker, không phải thiết bị đã làm theo (firmware không gửi lại).
 * Lỗi: 400/422 thân sai · 409 DEVICE_OFFLINE · 503 MQTT_DOWN (contract/README.md mục 6).
 *
 * @param {object} deps
 * @param {object} deps.config
 * @param {object} deps.state                     createState()
 * @param {(cmd: object) => Promise} deps.publishLedCmd   mqtt client
 * @param {() => Date} [deps.now]
 */
export function ledRoutes({ config, state, publishLedCmd, now = () => new Date() }) {
  const router = Router();
  const levelCount = config.contract?.led?.levelOrder?.length ?? 3;

  const send = (parse) => async (req, res) => {
    const r = parse(req.body);
    if (!r.ok) return sendError(res, r.status, r.code, r.message);

    // Thiết kế khóa gửi khi ngoại tuyến (HANDOFF ST-09); máy chủ cũng chặn để lệnh không nằm chờ trong broker.
    if (!state.device().online) {
      return sendError(res, 409, 'DEVICE_OFFLINE', 'Thiết bị đang ngoại tuyến, chưa gửi được lệnh đèn');
    }

    try {
      await withTimeout(publishLedCmd(r.cmd), PUBLISH_TIMEOUT_MS);
    } catch {
      return sendError(res, 503, 'MQTT_DOWN', 'Máy chủ chưa kết nối được broker MQTT');
    }

    const sentAt = now().toISOString();
    state.applyLedSent({ ...r.patch, sentAt });
    res.status(202).json({ sentAt });
  };

  router.post('/led/palette', send((body) => parsePaletteBody(body, { levelCount })));
  router.post('/led/test', send(parseTestBody));

  return router;
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); }),
  ]).finally(() => clearTimeout(timer));
}
