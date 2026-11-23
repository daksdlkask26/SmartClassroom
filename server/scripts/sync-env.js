import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, parseEnv } from 'node:util';

const templateFile = new URL('../.env.example', import.meta.url);
const envFile = fileURLToPath(new URL('../.env', import.meta.url));

function formatAssignment(key, value) {
  // Chọn cách ghi mà trình đọc .env của Node có thể đọc lại đúng giá trị.
  for (const quote of ['', "'", '`', '"']) {
    const line = `${key}=${quote}${value}${quote}`;
    if (isDeepStrictEqual(parseEnv(line), { [key]: value })) return line;
  }
  throw new Error(`Không thể ghi biến ${key} từ .env.example.`);
}

function mergeEnv(current, template) {
  const source = current.toString('utf8');
  const existing = parseEnv(source);
  const missing = Object.entries(parseEnv(template.toString('utf8')))
    .filter(([key]) => !Object.hasOwn(existing, key));
  if (missing.length === 0) return null;

  const newline = source.match(/\r?\n/)?.[0] ?? '\n';
  const separator = source && !source.endsWith('\n') ? newline : '';
  const assignments = missing.map(([key, value]) => formatAssignment(key, value));
  const addition = assignments.join('\n').replaceAll('\n', newline);
  const updated = Buffer.concat([current, Buffer.from(`${separator}${addition}${newline}`)]);

  // Một giá trị nhiều dòng chưa đóng trong .env có thể nuốt các dòng mới.
  const expected = { ...existing, ...Object.fromEntries(missing) };
  if (!isDeepStrictEqual(parseEnv(updated.toString('utf8')), expected)) {
    throw new Error('Hãy kiểm tra cú pháp trong .env rồi chạy lại.');
  }

  return { updated, message: `Đã thêm vào .env: ${missing.map(([key]) => key).join(', ')}.` };
}

function syncEnv(mode) {
  const updating = mode === 'update';
  // Nếu .env là liên kết, cập nhật file đích và giữ liên kết.
  const target = updating && fs.lstatSync(envFile, { throwIfNoEntry: false })?.isSymbolicLink()
    ? fs.realpathSync(envFile)
    : envFile;
  const temp = `${target}.sync.tmp`;
  let fd;
  try {
    fd = fs.openSync(temp, 'wx', 0o600);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    throw new Error(`File tạm ${temp} đang tồn tại. Xóa file tạm nếu lần đồng bộ trước đã dừng giữa chừng.`);
  }

  let committed = false;
  try {
    const stat = fs.lstatSync(target, { throwIfNoEntry: false });
    if (updating && !stat) throw new Error('Chưa có .env. Chạy npm run env:init trước.');
    if (!updating && stat) return '.env đã tồn tại. Dùng npm run env:update để bổ sung biến.';

    const template = fs.readFileSync(templateFile);
    const current = stat ? fs.readFileSync(target) : null;
    const change = current
      ? mergeEnv(current, template)
      : { updated: template, message: 'Đã tạo .env từ .env.example.' };
    if (!change) return '.env đã có đủ các biến trong mẫu.';

    fs.writeFileSync(fd, change.updated, { flush: true });
    if (stat && process.platform !== 'win32') fs.fchmodSync(fd, stat.mode & 0o777);
    fs.closeSync(fd);
    fd = undefined;

    const latest = fs.existsSync(target) ? fs.readFileSync(target) : null;
    if (!isDeepStrictEqual(latest, current)) {
      throw new Error(`.env vừa được thay đổi. Chạy lại npm run env:${mode}.`);
    }

    fs.renameSync(temp, target);
    committed = true;
    return change.message;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (!committed) fs.unlinkSync(temp);
  }
}

const mode = process.argv[2];
try {
  if (mode !== 'init' && mode !== 'update') {
    throw new Error('Chạy npm run env:init hoặc npm run env:update.');
  }
  console.log(syncEnv(mode));
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
