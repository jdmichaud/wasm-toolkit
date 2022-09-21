#!/usr/bin/env node

const fs = require('fs');

function createLinkWin(from, to) {
  fs.writeFileSync(to,
`#!/usr/bin/env sh
${from}.exe "$@"
`);

  fs.writeFileSync(`${to}.cmd`,
`@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0

"${from.replaceAll('/', '\\')}.exe" %*
`);
}

function createLinkLinux(from, to) {
  fs.symlink(from, to, 'file', (err) => { if (err !== undefined) console.error(err); });
}

const arch = `${process.arch}-${process.platform}`;
const distPath = `dist/${arch}`;
if (!fs.existsSync(distPath)) {
  console.error(`error: Unknown arch ${arch}`);
  console.error(`error: installation failed`);

  process.exit(1);
}

try {
  fs.mkdirSync('../../.bin/');
} catch (e) {
  if (e.code !== 'EEXIST') {
    throw e;
  }
}

const createLink = process.platform === 'linux' ? createLinkLinux : createLinkWin;
const cwd = __dirname.replaceAll('\\', '/');

if (process.platform === 'linux') {
  createLink(`${cwd}/${distPath}/clang-15`, '../../.bin/clang');
  createLink(`${cwd}/${distPath}/lld`, '../../.bin/wasm-ld');
  } else {
  createLink(`${cwd}/${distPath}/clang`, '../../.bin/clang');
  createLink(`${cwd}/${distPath}/wasm-ld`, '../../.bin/wasm-ld');
}
createLink(`${cwd}/${distPath}/spectest-interp`, '../../.bin/spectest-interp');
createLink(`${cwd}/${distPath}/wasm2c`, '../../.bin/wasm2c');
createLink(`${cwd}/${distPath}/wasm2wat`, '../../.bin/wasm2wat');
createLink(`${cwd}/${distPath}/wasm-decompile`, '../../.bin/wasm-decompile');
createLink(`${cwd}/${distPath}/wasm-interp`, '../../.bin/wasm-interp');
createLink(`${cwd}/${distPath}/wasm-objdump`, '../../.bin/wasm-objdump');
createLink(`${cwd}/${distPath}/wasm-opcodecnt`, '../../.bin/wasm-opcodecnt');
createLink(`${cwd}/${distPath}/wasm-strip`, '../../.bin/wasm-strip');
createLink(`${cwd}/${distPath}/wasm-validate`, '../../.bin/wasm-validate');
createLink(`${cwd}/${distPath}/wast2json`, '../../.bin/wast2json');
createLink(`${cwd}/${distPath}/wat2wasm`, '../../.bin/wat2wasm');
createLink(`${cwd}/${distPath}/wat-desugar`, '../../.bin/wat-desugar');
