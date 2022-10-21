#!/usr/bin/env bash

WASI_SDK_TAG="wasi-sdk-16"
if [ $# -eq 1 ]
then
  WASI_SDK_TAG=$1
fi
FOLDER=$(pwd)/${WASI_SDK_TAG}
BIN_FOLDER="${FOLDER}/build/llvm/bin"

if [[ ! -n $(which cmake) ]] && [[ ! -x $(which cmake) ]]
then
  echo "error: cmake must be installed"
  exit 2
fi

if [[ ! -n $(which ninja) ]] && [[ ! -x $(which ninja) ]]
then
  echo "error: ninja must be installed"
  exit 2
fi

echo "building ${WASI_SDK_TAG}"
pushd . > /dev/null

# Download llvm repository
if [ ! -d ${FOLDER} ]
then
  git clone --recursive https://github.com/WebAssembly/wasi-sdk.git --branch ${WASI_SDK_TAG} --single-branch --depth 1 ${FOLDER}
fi
cd ${FOLDER}

if patch --dry-run --reverse --force < ../clang-static.patch >/dev/null 2>&1; then
  echo "Patch already applied - skipping."
else # patch not yet applied
  echo "Patching..."
  patch -Ns < ../clang-static.patch || (echo "Patch failed" >&2 && exit 1)
fi

echo ${BIN_FOLDER}
if [ ! -d ${BIN_FOLDER} ]
then
  echo "make"
  make -j$(nproc) package
fi

# echo "done for now."
# exit 0
# Check executables are properly created and get their full paths
cd ${BIN_FOLDER}
CLANG_BIN=$(realpath $(readlink clang))
LLD_BIN=$(realpath lld)
if [ ! -x "$CLANG_BIN" ]
then
  echo "error: clang not found or not executable ($CLANG_BIN)"
  exit 1
fi

if [ ! -x "$LLD_BIN" ]
then
  echo "error: lld not found or not executable ($LDD_BIN)"
  exit 1
fi

popd > /dev/null

# Install the executables in dist
DIST=dist/$(node -e 'console.log(`${process.arch}-${process.platform}`)')
mkdir -p ${DIST}
cp -v ${CLANG_BIN} ${DIST}/
cp -v ${LLD_BIN} ${DIST}/
strip ${DIST}/*

echo "done."
