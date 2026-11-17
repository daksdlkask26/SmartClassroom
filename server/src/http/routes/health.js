import { Router } from 'express';

/**
 * GET /api/health → { ok, mqtt, mode, uptimeS, contractVersion }
 * @param {{ config: object, getMqttStatus: () => 'connected' | 'disconnected' }} deps
 */
export function healthRoutes({ config, getMqttStatus }) {
  const router = Router();
  const startedAt = Date.now();

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      mqtt: getMqttStatus(),
      mode: config.mode,
      uptimeS: Math.floor((Date.now() - startedAt) / 1000),
      contractVersion: config.contract.contractVersion,
    });
  });

  return router;
}
