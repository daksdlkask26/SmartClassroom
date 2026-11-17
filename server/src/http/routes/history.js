// GET /api/history?metric=humidity&from=ISO&to=ISO&bucket=hour|day
// Định dạng trả về: contract/examples/api.history.json. Phần thật (Firestore) là ID 5 của Tuấn;
// route chỉ kiểm tra tham số rồi gọi provider.query().
import { Router } from 'express';
import { ApiError } from '../errors.js';
import { METRICS } from '../../core/levels.js';

const DAY_MS = 24 * 3600 * 1000;
const LIMITS = { hour: { def: 1, max: 7 }, day: { def: 7, max: 93 } }; // số ngày mặc định / tối đa

export function parseHistoryQuery(q, now = new Date()) {
  const metric = q.metric;
  if (!METRICS.includes(metric)) throw new ApiError(400, 'BAD_REQUEST', `metric phải là ${METRICS.join(', ')}`);

  const bucket = q.bucket ?? 'hour';
  if (!LIMITS[bucket]) throw new ApiError(400, 'BAD_REQUEST', 'bucket phải là hour hoặc day');

  const parse = (v, name) => {
    if (v === undefined) return undefined;
    const d = new Date(v);
    if (typeof v !== 'string' || Number.isNaN(d.getTime())) throw new ApiError(400, 'BAD_REQUEST', `${name} không phải ngày giờ ISO 8601`);
    return d;
  };
  const to = parse(q.to, 'to') ?? now;
  const from = parse(q.from, 'from') ?? new Date(to.getTime() - LIMITS[bucket].def * DAY_MS);

  if (from >= to) throw new ApiError(400, 'BAD_REQUEST', 'Ngày bắt đầu phải trước ngày kết thúc');
  if (to - from > LIMITS[bucket].max * DAY_MS) {
    throw new ApiError(400, 'BAD_REQUEST', `Khoảng tối đa ${LIMITS[bucket].max} ngày khi xem theo ${bucket === 'hour' ? 'giờ' : 'ngày'}`);
  }
  return { metric, bucket, from, to };
}

export function historyRoutes({ history }) {
  const router = Router();
  router.get('/history', async (req, res) => {
    const q = parseHistoryQuery(req.query);
    res.json(await history.query(q));
  });
  return router;
}
