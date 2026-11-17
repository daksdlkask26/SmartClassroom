const { rmSync } = require('node:fs');
const { basename, dirname, resolve } = require('node:path');
const { tmpdir } = require('node:os');

function removeTestTemp(dir) {
  const target = resolve(dir);
  if (dirname(target) !== resolve(tmpdir()) || !/^smartclassroom[ -]/.test(basename(target))) {
    throw new Error('Refusing to remove a directory outside the generated test fixtures.');
  }
  rmSync(target, { recursive: true, force: true });
}

module.exports = { removeTestTemp };
