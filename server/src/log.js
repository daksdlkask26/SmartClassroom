// Ghi log một dòng: giờ · mức · phạm vi · nội dung. Không dùng thư viện ngoài.
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

export function createLogger(level = 'info', scope = 'app') {
  const max = LEVELS[level] ?? LEVELS.info;
  const write = (lvl, args) => {
    if (LEVELS[lvl] > max) return;
    const line = [new Date().toISOString(), lvl.toUpperCase().padEnd(5), `[${scope}]`, ...args];
    (lvl === 'error' || lvl === 'warn' ? console.error : console.log)(...line);
  };
  return {
    error: (...a) => write('error', a),
    warn: (...a) => write('warn', a),
    info: (...a) => write('info', a),
    debug: (...a) => write('debug', a),
    child: (sub) => createLogger(level, `${scope}:${sub}`),
  };
}
