#!/usr/bin/env node

const fs = require('fs');

const arch = `${process.arch}-${process.platform}`;
const distPath = `dist/${arch}`;
if (!fs.existsSync(distPath)) {
  console.error(`error: Unknown arch ${arch}`);
  console.error(`error: installation failed`);

  process.exit(1);
}

fs.mkdirSync('../../.bin/');
fs.symlink(`${__dirname}/${distPath}/clang-15`, '../../.bin/clang', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/lld`, '../../.bin/lld', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/lld`, '../../.bin/wasm-ld', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/lld`, '../../.bin/ld64.lld', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/lld`, '../../.bin/ld.lld', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/lld`, '../../.bin/lld-link', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/spectest-interp`, '../../.bin/spectest-interp', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm2c`, '../../.bin/wasm2c', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm2wat`, '../../.bin/wasm2wat', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm-decompile`, '../../.bin/wasm-decompile', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm-interp`, '../../.bin/wasm-interp', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm-objdump`, '../../.bin/wasm-objdump', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm-opcodecnt`, '../../.bin/wasm-opcodecnt', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm-strip`, '../../.bin/wasm-strip', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wasm-validate`, '../../.bin/wasm-validate', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wast2json`, '../../.bin/wast2json', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wat2wasm`, '../../.bin/wat2wasm', 'file', (err) => { if (err !== undefined) console.error(err); });
fs.symlink(`${__dirname}/${distPath}/wat-desugar`, '../../.bin/wat-desugar', 'file', (err) => { if (err !== undefined) console.error(err); });

