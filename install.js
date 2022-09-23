#!/usr/bin/env node

const isWindows = process.platform === 'win32' ||
  process.env.OSTYPE === 'cygwin' ||
  process.env.OSTYPE === 'msys'

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

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

"${from.replace(/\//g, '\\')}.exe" %*
`);
}

function createLinkLinux(from, to) {
  fs.symlink(from, to, 'file', (err) => { if (err !== undefined) console.error(err); });
}

// Check the provided clang binary is able to build a simple WASM program.
function compileToWasm(clangPath) {
  return new Promise(resolve => {
    const testProgram = 'int add(int lhs, int rhs) { return lhs + rhs; }';
    const child = spawn(clangPath, ['-x', 'c', '--target=wasm32',
      '--no-standard-libraries', '-Wl,--export-all',
      '-Wl,--no-entry,--allow-undefined', '-']);

    child.stdin.write(testProgram);
    child.stdout.on('data', data => {
      console.log(data.toString()); // Should not produce anything, but just in case.
    });
    child.stderr.on('data', data => {
      console.error(data.toString());
    });
    child.on('close', (exitCode) => {
      resolve(exitCode);
    });
    child.stdin.end();
  });
}

// Is the path provided is an executable file.
function isExe(pathToTest) {
  if (isWindows) {
    const pathExt = process.env.PATHEXT.split(';') ?? ['.EXE', '.CMD', '.BAT', '.COM'];
    return ['', ...pathExt].some(ext => {
      let stat;
      try { stat = fs.statSync(path.join(pathToTest, ext), { throwIfNoEntry: false }); } catch (e) {}
      return stat !== undefined && stat.isFile();
    });
  }
  // on unix like
  const stat = fs.statSync(pathToTest, { throwIfNoEntry: false });
  if (stat === undefined) return false;
  return stat.isFile() && (stat.mode & fs.constants.X_OK);
}

// Return the full path the requested executable.
function which(prgmName) {
  return process.env.PATH.split(isWindows ? ';' : ':').map(dirPath => {
    return path.join(dirPath, prgmName);
  }).find(possiblePath => isExe(possiblePath));
}

// Check if a local clang is able to build a simple WASM program.
async function checkLocalClang() {
  const clangPath = which('clang');
  if (clangPath === undefined) {
    return false;
  }
  const exitCode = await compileToWasm(clangPath);
  return exitCode === 0;
}

async function main() {
  const createLink = process.platform === 'linux' ? createLinkLinux : createLinkWin;
  try {
    fs.mkdirSync('../../.bin/');
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }

  const localClangOk = await checkLocalClang();
  if (localClangOk) {
    // Local clang is able to compile to wasm. Link to it and bail.
    createLink(which('clang'), '../../.bin/clang');
    return 0;
  }
  // No local clang, use ours.
  const arch = `${process.arch}-${process.platform}`;
  const distPath = `dist/${arch}`;
  if (!fs.existsSync(distPath)) {
    console.error(`error: Unknown arch ${arch}`);
    console.error(`error: installation failed`);

    process.exit(1);
  }

  const cwd = __dirname.replace(/\\/g, '/');

  if (isWindows) {
    createLink(`${cwd}/${distPath}/clang`, '../../.bin/clang');
    createLink(`${cwd}/${distPath}/wasm-ld`, '../../.bin/wasm-ld');
    } else {
    createLink(`${cwd}/${distPath}/clang-15`, '../../.bin/clang');
    createLink(`${cwd}/${distPath}/lld`, '../../.bin/wasm-ld');
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

  return 0
}

main().then(ret => process.exit(ret));
