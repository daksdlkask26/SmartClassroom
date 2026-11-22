import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Xóa thư mục tạm của kiểm thử. Từ chối mọi thư mục không phải do kiểm thử tự tạo
 * (nằm trực tiếp trong thư mục tạm và tên bắt đầu bằng "smartclassroom").
 */
export function removeTestTemp(dir) {
  const target = path.resolve(dir);
  if (path.dirname(target) !== path.resolve(os.tmpdir()) || !/^smartclassroom[ -]/.test(path.basename(target))) {
    throw new Error('Từ chối xóa thư mục không phải dữ liệu tạo ra bởi kiểm thử.');
  }
  fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
