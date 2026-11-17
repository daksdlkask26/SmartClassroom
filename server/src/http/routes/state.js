import { Router } from 'express';

/**
 * GET /api/config  → contract/system.json
 * GET /api/state   → như `data` của tin WebSocket `hello` (dự phòng khi không có WebSocket)
 */
export function stateRoutes({ config, state }) {
  const router = Router();

  router.get('/config', (_req, res) => res.json(config.contract));

  router.get('/state', (_req, res) => {
    res.json({ serverTime: new Date().toISOString(), mode: config.mode, config: config.contract, ...state.snapshot() });
  });

  return router;
}
