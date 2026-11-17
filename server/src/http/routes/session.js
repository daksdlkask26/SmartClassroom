// GET /api/session — bản tạm cho đến ID 8 (đăng nhập). Khi AUTH_ENABLED=false luôn trả người dùng mẫu
// của thiết kế (giangvien01), để giao diện hiện đủ thanh trên cùng và rail.
import { Router } from 'express';

export function sessionRoutes({ config }) {
  const router = Router();
  router.get('/session', (_req, res) => {
    res.json({ authEnabled: config.authEnabled, user: config.authEnabled ? null : { username: 'giangvien01' } });
  });
  return router;
}
